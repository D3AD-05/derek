from sqlalchemy.orm import Session
from sqlalchemy import delete
from src.models.user import User
from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.session import SessionQuestion
from src.services.session.common.preconditions import ensure_session_exists
from src.services.question.common.preconditions import ensure_question_exists
from .common.schemas import UpdateSessionQuestionData


def update_session_questions_service(
    *,
    session: Session,
    session_id: int,
    data: UpdateSessionQuestionData,
):

    ensure_session_exists(session=session, id=session_id)

    # validate duplicates early
    question_ids = [q.question_id for q in data.questions]
    if len(question_ids) != len(set(question_ids)):
        raise ValueError("Duplicate question_id in payload")

    positions = [q.position for q in data.questions]
    if len(positions) != len(set(positions)):
        raise ValueError("Duplicate position in payload")

    with transactional(session):
        # 1️ delete existing mappings
        session.execute(
            delete(SessionQuestion).where(SessionQuestion.session_id == session_id)
        )

        # 2️ add
        session_questions = []
        for item in data.questions:
            ensure_question_exists(session=session, id=item.question_id)

            obj = SessionQuestion(
                session_id=session_id,
                question_id=item.question_id,
                position=item.position,
            )
            session.add(obj)
            session_questions.append(obj)

        session.flush()

    return session_questions
