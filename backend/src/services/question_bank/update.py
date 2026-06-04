from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from .common.schemas import QuestionBankUpdateData
from .common.loaders import get_QB_or_raise


def update_question_bank_service(
    *,
    session: Session,
    question_bank_id: int,
    data: QuestionBankUpdateData,
    current_user: User,
) -> User:

    # Loaders
    questionBank = get_QB_or_raise(session=session, id=question_bank_id)

    with transactional(session):
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(questionBank, key, value)
        questionBank.updated_by = current_user.id

        return questionBank
