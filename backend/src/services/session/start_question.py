from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from src.core.permissions import require_platform_admin
from src.models.question import Option, Question
from src.models.session import SessionQuestion, Session as SessionModel
from src.models.user import User


def start_question_service(
    *,
    session: Session,
    session_id: int,
    question_id: int,
    current_user: User,
) -> dict:

    stmt = (
        select(SessionQuestion)
        .where(
            SessionQuestion.session_id == session_id,
            SessionQuestion.question_id == question_id,
        )
        .options(
            joinedload(SessionQuestion.question).joinedload(Question.answer_type),
            joinedload(SessionQuestion.question).selectinload(Question.options),
        )
    )

    session_question = session.scalar(stmt)
    if session_question is None or session_question.question is None:
        return {
            "type": "question_started",
            "session_id": session_id,
            "error": "session_question_not_found",
        }

    # ✅ Update
    session_question.is_triggered = True
    session.add(session_question)

    session_data = session.scalar(
        select(SessionModel).where(SessionModel.id == session_id)
    )
    if session_data:
        session_data.last_triggered_question_id = question_id
        session.add(session_data)

    question = session_question.question

    answer_type_code = None
    try:
        answer_type_code = question.answer_type.code if question.answer_type else None
    except Exception:
        answer_type_code = None

    options = []
    for opt in question.options or []:
        if not isinstance(opt, Option):
            continue
        options.append({"id": opt.id, "label": opt.option_text, "score": opt.score})

    payload = {
        "type": "question_started",
        "session_id": session_id,
        "question": {
            "id": question.id,
            "text": question.title,
            "type": (str(answer_type_code).upper() if answer_type_code else None),
            "options": options,
            "timeout_ms": question.time_limit_ms,
        },
    }

    return payload
