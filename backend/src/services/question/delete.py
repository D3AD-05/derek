from sqlalchemy.orm import Session

from src.core.database import transactional
from src.models.user import User

from .common.loaders import get_question_or_raise
from src.services.session_question.common.loaders import (
    is_question_used_in_session,
)


def delete_question_service(*, session: Session, question_id: int, current_user: User):

    # ensure question exists
    question = get_question_or_raise(session=session, id=question_id)
    is_question_used = is_question_used_in_session(session=session, id=question_id)
    with transactional(session):
        if is_question_used:
            # detach instead of delete
            question.question_bank_id = None
        else:
            # safe to delete
            session.delete(question)
