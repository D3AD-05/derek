from os import name
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User

from .common.schemas import QuestionBankData
from src.services.community.common.preconditions import ensure_community_exists
from src.models.question_bank import QuestionBank


def create_question_bank_service(
    *, session: Session, data: QuestionBankData, current_user: User
):
    ensure_community_exists(session=session, id=data.community_id)
    with transactional(session):
        new_question_bank = QuestionBank(
            name=data.name,
            description=data.description,
            community_id=data.community_id,
            created_by=current_user.id,
            updated_by=current_user.id,
        )
        session.add(new_question_bank)
        return new_question_bank
