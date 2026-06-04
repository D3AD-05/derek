from __future__ import annotations

import json
import logging

from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
from pydantic import ValidationError

from src.api.ws.common.schemas import SubmitAnswerWSIn
from src.core.exceptions import AuthenticationError
from src.core.session_participant_tokens import decode_session_participant_token
from src.core.database import SessionLocal
from src.core.ws import ws_manager
from sqlalchemy import select

from src.models.session import SessionParticipant, SessionQuestion
from src.api.common.ws_guards import authenticate_ws_user
from src.services.session_participant_question.queue import enqueue_submit_answer

log = logging.getLogger("core_logger")


async def session_ws_handler(*, websocket: WebSocket, session_id: int) -> None:
    token = websocket.query_params.get("token")

    # no token
    if not token:
        auth_header = websocket.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip() or None

    await websocket.accept()

    if not token:
        await websocket.send_text(
            json.dumps({"type": "error", "error": "missing_token"})
        )
        await websocket.close(code=1008)
        return

    try:
        # participiant token
        claims = decode_session_participant_token(token)
    except AuthenticationError as e:
        err_msg = str(e)
        if err_msg != "wrong_token_type":
            await websocket.send_text(
                json.dumps({"type": "error", "error": "invalid_token"})
            )
            await websocket.close(code=1008)
            return

        # Fallback: allow any authenticated user to connect with a normal access token.
        with SessionLocal() as db:
            access_user = authenticate_ws_user(session=db, websocket=websocket)

        if not access_user:
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "error",
                        "error": "invalid_access_token",
                        "details": "Use a valid access token (Authorization: Bearer ...) or a participant_token from /api/session_participant/join/{session_id}.",
                    }
                )
            )
            await websocket.close(code=1008)
            return

        # Access-token connection: listen-only (receives broadcasts) and cannot submit answers.
        mode = "admin"
        user_id = int(access_user.id)
        session_participant_id = None
    else:
        mode = "participant"

        if int(claims.sid) != int(session_id):
            await websocket.send_text(
                json.dumps({"type": "error", "error": "token_session_mismatch"})
            )
            await websocket.close(code=1008)
            return

        user_id = int(claims.uid)
        session_participant_id = int(claims.spid)

        # Validate participant belongs to this session/user.
        with SessionLocal() as db:
            participant = db.get(SessionParticipant, session_participant_id)
            participant_ok = (
                participant is not None
                and participant.session_id == session_id
                and participant.user_id == user_id
            )

        if not participant_ok:
            await websocket.send_text(
                json.dumps({"type": "error", "error": "invalid_session_participant"})
            )
            await websocket.close(code=1008)
            return

    await ws_manager.connect(str(session_id), websocket)

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                payload = SubmitAnswerWSIn.model_validate_json(raw)
            except ValidationError as ve:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error": "invalid_payload",
                            "details": ve.errors(),
                        }
                    )
                )
                continue

            if mode == "admin":
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error": "forbidden",
                            "details": "Access-token connections are listen-only on this WS endpoint.",
                        }
                    )
                )
                continue

            # Validate identifiers early #^ (so ack means the job will likely succeed)
            with SessionLocal() as db:
                session_question_exists = (
                    db.scalar(
                        select(SessionQuestion.id).where(
                            SessionQuestion.session_id == session_id,
                            SessionQuestion.question_id == payload.question_id,
                        )
                    )
                    is not None
                )

            if not session_question_exists:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error": "session_question_not_found",
                        }
                    )
                )
                continue

            ok = enqueue_submit_answer(
                session_id=session_id,
                user_id=user_id,
                session_participant_id=int(session_participant_id),
                payload=payload,
            )

            if not ok:
                log.error(
                    "enqueue_failed queue_full session_id=%s user_id=%s",
                    session_id,
                    user_id,
                )
                await websocket.send_text(
                    json.dumps({"type": "error", "error": "queue_full"})
                )
                continue

            await websocket.send_text(
                json.dumps(
                    {
                        "type": "ack",
                        "request_type": payload.type,
                        "question_id": payload.question_id,
                    }
                )
            )

    except WebSocketDisconnect:
        await ws_manager.disconnect(str(session_id), websocket)
    except Exception:
        log.exception("ws_handler_failed session_id=%s", session_id)
        await ws_manager.disconnect(str(session_id), websocket)
        await websocket.close(code=1011)
