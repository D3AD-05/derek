from __future__ import annotations

import json
import logging
import threading
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.database import SessionLocal
from src.core.ws import ws_manager
from src.models.session import (
    SessionParticipantQuestion,
    SessionParticipantQuestionOption,
    SessionQuestion,
)
from src.services.session.leaderboard import get_session_leaderboard

from .queue import dequeue_submit_answer
from .submit import submit_answer_service

log = logging.getLogger("core_logger")


# def _utcnow() -> datetime:
#     return datetime.now(timezone.utc)


def _broadcast_option_counts(
    *, session: Session, session_id: int, question_id: int
) -> None:
    # & Count for each option_id
    rows = session.execute(
        select(
            SessionParticipantQuestionOption.option_id,
            func.count().label("count"),
        )
        .select_from(SessionParticipantQuestionOption)
        .join(
            SessionParticipantQuestion,
            SessionParticipantQuestion.id
            == SessionParticipantQuestionOption.session_participant_question_id,
        )
        .join(
            SessionQuestion,
            SessionQuestion.id == SessionParticipantQuestion.session_question_id,
        )
        .where(
            SessionQuestion.session_id == session_id,
            SessionQuestion.question_id == question_id,
        )
        .group_by(SessionParticipantQuestionOption.option_id)
    ).all()

    # ^ TOTAL RESPONSE INCASE NEEDED #TODO
    total_responses = (
        session.scalar(
            select(func.count(func.distinct(SessionParticipantQuestion.id)))
            .select_from(SessionParticipantQuestion)
            .join(
                SessionQuestion,
                SessionQuestion.id == SessionParticipantQuestion.session_question_id,
            )
            .where(
                SessionQuestion.session_id == session_id,
                SessionQuestion.question_id == question_id,
            )
        )
        or 0
    )

    items = [
        {
            "option_id": int(row.option_id),
            "count": int(row.count or 0),
        }
        for row in rows
        if row.option_id is not None
    ]

    payload = {
        "type": "answer_option_counts",
        "session_id": int(session_id),
        "question_id": int(question_id),
        "total_responses": int(total_responses),
        "items": items,
    }

    ws_manager.broadcast_text_threadsafe(str(session_id), json.dumps(payload))


def _run_queue_worker(stop: threading.Event) -> None:
    while not stop.is_set():
        job = dequeue_submit_answer(timeout_s=1.0)
        if job is None:
            continue

        try:
            with SessionLocal() as session:
                submit_answer_service(
                    session=session,
                    session_id=job.session_id,
                    user_id=job.user_id,
                    session_participant_id=job.session_participant_id,
                    data=job.payload,
                )

                try:
                    _broadcast_option_counts(
                        session=session,
                        session_id=int(job.session_id),
                        question_id=int(job.payload.question_id),
                    )
                except Exception:
                    log.exception(
                        "option_counts_broadcast_failed session_id=%s question_id=%s",
                        job.session_id,
                        getattr(job.payload, "question_id", None),
                    )

                try:
                    leaderboard = get_session_leaderboard(
                        session=session, session_id=int(job.session_id)
                    )
                    payload = {
                        "type": "leaderboard_updated",
                        "session_id": int(job.session_id),
                        "items": leaderboard,
                    }
                    ws_manager.broadcast_text_threadsafe(
                        str(job.session_id), json.dumps(payload)
                    )
                except Exception:
                    log.exception(
                        "leaderboard_broadcast_failed session_id=%s",
                        job.session_id,
                    )
        except Exception:
            log.exception(
                "submit_answer_failed session_id=%s user_id=%s question_id=%s",
                job.session_id,
                job.user_id,
                getattr(job.payload, "question_id", None),
            )


def start_answer_workers() -> None:
    stop = threading.Event()

    t1 = threading.Thread(target=_run_queue_worker, args=(stop,), daemon=True)

    t1.start()

    log.info("answer_workers_started")
