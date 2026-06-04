from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from src.api.ws.common.schemas import SubmitAnswerWSIn
from src.core.database import transactional
from src.core.exceptions import AuthorizationError, NotFoundError
from src.models.session import (
    SessionParticipant,
    SessionParticipantQuestion,
    SessionParticipantQuestionOption,
)
from src.models.question import Option

from src.services.user.common.preconditions import ensure_user_exists

from .common.loaders import (
    get_answer_status_or_raise,
    get_participant_or_raise,
    get_session_question_by_session_question_or_raise,
)

log = logging.getLogger("core_logger")


def submit_answer_service(
    *,
    session: Session,
    session_id: int,
    user_id: int,
    session_participant_id: int,
    data: SubmitAnswerWSIn,
) -> SessionParticipantQuestion:
    ensure_user_exists(session=session, id=user_id)

    participant = get_participant_or_raise(session=session, id=session_participant_id)
    if participant.session_id != session_id or participant.user_id != user_id:
        raise AuthorizationError(
            "session_participant_id does not belong to this session/user"
        )

    session_question = get_session_question_by_session_question_or_raise(
        session=session, session_id=session_id, question_id=data.question_id
    )

    # Timing enforcement (client-reported for now)
    answer_status_id = data.answer_status_id

    has_option_payload = data.option_ids is not None or data.option_id is not None
    option_ids: list[int] = []
    if data.option_ids:
        option_ids = list(dict.fromkeys(data.option_ids))
    elif data.option_id is not None:
        option_ids = [data.option_id]

    score = data.score
    if has_option_payload:
        if option_ids:
            rows = session.execute(
                select(Option.id, Option.score).where(
                    Option.id.in_(option_ids),
                    Option.question_id == session_question.question_id,
                )
            ).all()

            found_ids = {row.id for row in rows}
            missing_ids = sorted(set(option_ids) - found_ids)
            if missing_ids:
                raise NotFoundError(
                    f"Option(s) not found for question_id={data.question_id}: {missing_ids}"
                )

            if getattr(session_question.question, "is_scored", True):
                score = int(sum((row.score or 0) for row in rows))
            else:
                score = 0
        else:
            score = 0

    timeout_status = get_answer_status_or_raise(session=session, code="timeout")
    time_limit_ms = None
    try:
        time_limit_ms = getattr(session_question.question, "time_limit_ms", None)
    except Exception:
        time_limit_ms = None

    if time_limit_ms is not None and data.time_taken_ms > int(time_limit_ms):
        answer_status_id = timeout_status.id
        score = 0

    with transactional(session):
        existed_before = session.scalar(
            select(SessionParticipantQuestion.id).where(
                SessionParticipantQuestion.session_participant_id == participant.id,
                SessionParticipantQuestion.session_question_id == session_question.id,
            )
        )

        stmt = (
            insert(SessionParticipantQuestion)
            .values(
                session_participant_id=participant.id,
                session_question_id=session_question.id,
                answer_status_id=answer_status_id,
                score=score,
                time_taken_ms=data.time_taken_ms,
                answer_text=data.answer_text,
            )
            .on_conflict_do_update(
                index_elements=[
                    SessionParticipantQuestion.session_participant_id,
                    SessionParticipantQuestion.session_question_id,
                ],
                set_={
                    "answer_status_id": answer_status_id,
                    "score": score,
                    "time_taken_ms": data.time_taken_ms,
                    "answer_text": data.answer_text,
                },
            )
            .returning(SessionParticipantQuestion.id)
        )

        spq_id = session.execute(stmt).scalar_one()
        spq = session.get(SessionParticipantQuestion, spq_id)

        if existed_before is not None:
            log.info(
                "answer_upsert_conflict session_id=%s user_id=%s question_id=%s",
                session_id,
                user_id,
                data.question_id,
            )

        # Store selected options (multi-select)
        if has_option_payload:
            session.execute(
                delete(SessionParticipantQuestionOption).where(
                    SessionParticipantQuestionOption.session_participant_question_id
                    == spq_id
                )
            )
            if option_ids:
                session.add_all(
                    [
                        SessionParticipantQuestionOption(
                            session_participant_question_id=spq_id,
                            option_id=option_id,
                        )
                        for option_id in option_ids
                    ]
                )

        # Aggregate totals async (done in worker, not WS handler)
        totals = session.execute(
            select(
                func.coalesce(func.sum(SessionParticipantQuestion.score), 0),
                func.coalesce(func.sum(SessionParticipantQuestion.time_taken_ms), 0),
            ).where(SessionParticipantQuestion.session_participant_id == participant.id)
        ).one()

        session.execute(
            update(SessionParticipant)
            .where(SessionParticipant.id == participant.id)
            .values(total_score=int(totals[0]), total_time_taken_ms=int(totals[1]))
        )

        session.flush()

    return spq
