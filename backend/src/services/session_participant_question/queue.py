from __future__ import annotations

import queue
from dataclasses import dataclass
from datetime import datetime, timezone

from src.api.ws.common.schemas import SubmitAnswerWSIn


@dataclass(frozen=True)
class SubmitAnswerJob:
    session_id: int
    user_id: int
    session_participant_id: int
    payload: SubmitAnswerWSIn
    received_at: datetime


_MAX_QUEUE_SIZE = 50_000
_answer_queue: "queue.Queue[SubmitAnswerJob]" = queue.Queue(maxsize=_MAX_QUEUE_SIZE)


def enqueue_submit_answer(
    *, session_id: int, user_id: int, session_participant_id: int, payload: SubmitAnswerWSIn
) -> bool:
    job = SubmitAnswerJob(
        session_id=session_id,
        user_id=user_id,
        session_participant_id=session_participant_id,
        payload=payload,
        received_at=datetime.now(timezone.utc),
    )

    try:
        _answer_queue.put_nowait(job)
        return True
    except queue.Full:
        return False


def dequeue_submit_answer(timeout_s: float = 1.0) -> SubmitAnswerJob | None:
    try:
        return _answer_queue.get(timeout=timeout_s)
    except queue.Empty:
        return None
