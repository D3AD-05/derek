from __future__ import annotations

import json
import logging

from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
from sqlalchemy import select

from src.api.common.ws_guards import authenticate_ws_user
from src.core.database import SessionLocal
from src.core.exceptions import AuthenticationError
from src.core.session_participant_tokens import decode_session_participant_token
from src.core.ws import ws_manager
from src.models.session import Session as SessionModel, SessionStatus
from src.models.session import SessionParticipant
from src.services.session.leaderboard import get_session_leaderboard

log = logging.getLogger("core_logger")


async def leaderboard_ws_handler(*, websocket: WebSocket, session_id: int) -> None:
    """Listen-only leaderboard WS.

        - Requires a participant_token (from join) OR any valid access token.
    - Only accepts connections when the session status is `ongoing`.
    - Sends `leaderboard_snapshot` immediately, then relies on worker broadcasts
      (`leaderboard_updated`) on the same session WS group.
    """

    token = websocket.query_params.get("token")
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

    # Validate token (participant OR access token)
    try:
        claims = decode_session_participant_token(token)
    except AuthenticationError as e:
        err_msg = str(e)
        if err_msg != "wrong_token_type":
            await websocket.send_text(
                json.dumps({"type": "error", "error": "invalid_token"})
            )
            await websocket.close(code=1008)
            return

        # Access token fallback (any authenticated user)
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
    else:
        if int(claims.sid) != int(session_id):
            await websocket.send_text(
                json.dumps({"type": "error", "error": "token_session_mismatch"})
            )
            await websocket.close(code=1008)
            return

        user_id = int(claims.uid)
        session_participant_id = int(claims.spid)

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

    # Only for ongoing sessions
    with SessionLocal() as db:
        status_code = db.scalar(
            select(SessionStatus.code)
            .join(SessionModel, SessionModel.session_status_id == SessionStatus.id)
            .where(SessionModel.id == session_id)
        )

    if status_code != "ongoing":
        await websocket.send_text(
            json.dumps(
                {
                    "type": "error",
                    "error": "session_not_ongoing",
                    "details": "Use GET /api/session/{session_id}/leaderboard when session is completed.",
                }
            )
        )
        await websocket.close(code=1008)
        return

    await ws_manager.connect(str(session_id), websocket)

    try:
        # Initial snapshot
        with SessionLocal() as db:
            items = get_session_leaderboard(session=db, session_id=session_id)
        await websocket.send_text(
            json.dumps(
                {
                    "type": "leaderboard_snapshot",
                    "session_id": int(session_id),
                    "items": items,
                }
            )
        )

        while True:
            # Listen-only: keep connection alive + detect disconnects
            _ = await websocket.receive_text()
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "error",
                        "error": "listen_only",
                        "details": "This endpoint is listen-only; ignore this error and stop sending messages.",
                    }
                )
            )

    except WebSocketDisconnect:
        await ws_manager.disconnect(str(session_id), websocket)
    except Exception:
        log.exception("leaderboard_ws_failed session_id=%s", session_id)
        await ws_manager.disconnect(str(session_id), websocket)
        await websocket.close(code=1011)
