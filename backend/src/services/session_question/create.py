from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.services.session_question.common.schemas import CreateSessionQuestionData
from src.services.session.common.preconditions import ensure_session_exists
from src.services.question.common.preconditions import ensure_question_exists
from src.models.session import SessionQuestion


def create_session_service(*, session: Session, data: CreateSessionQuestionData):

    ensure_session_exists(session=session, id=data.session_id)

    for item in data.questions:
        ensure_question_exists(session=session, id=item.question_id)

    question_ids = [q.question_id for q in data.questions]
    if len(question_ids) != len(set(question_ids)):
        raise ValueError("Duplicate question_id in request payload")

    positions = [q.position for q in data.questions]
    if len(positions) != len(set(positions)):
        raise ValueError("Duplicate position in request payload")

    with transactional(session):
        session_questions = []
        for item in data.questions:
            new_session_question = SessionQuestion(
                session_id=data.session_id,
                question_id=item.question_id,
                position=item.position,
            )
            session_questions.append(new_session_question)
            session.add(new_session_question)
        session.flush()
    return new_session_question
