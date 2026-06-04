from sqlalchemy import delete, update
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.question import Question
from src.models.question_bank import QuestionBank
from .common.preconditions import ensure_question_bank_exists


def delete_question_bank_service(
    *, session: Session, question_bank_id: int, current_user: User
) -> None:
    # Preconditions
    ensure_question_bank_exists(session=session, id=question_bank_id)

    # Delete QuestionBank
    with transactional(session):
        #  detach questions before deleting
        session.execute(
            update(Question)
            .where(Question.question_bank_id == question_bank_id)
            .values(question_bank_id=None)
        )
        session.execute(delete(QuestionBank).where(QuestionBank.id == question_bank_id))
