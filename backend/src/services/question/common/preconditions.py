from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from .loaders import get_question_or_raise, get_answer_type_or_raise
from .params import QuestionFilterParams

from src.services.user.common.preconditions import ensure_user_exists
from src.services.question_bank.common.preconditions import ensure_question_bank_exists


def ensure_question_exists(*, session: Session, id: int):
    get_question_or_raise(session=session, id=id)


def ensure_answer_type_exists(*, session: Session, id: int):
    get_answer_type_or_raise(session=session, id=id)


def ensure_filter_params_valid(*, session: Session, filters: QuestionFilterParams):
    if filters.created_by:
        ensure_user_exists(session=session, id=filters.created_by)

    if filters.updated_by:
        ensure_user_exists(session=session, id=filters.updated_by)

    if filters.answer_type_id:
        ensure_answer_type_exists(session=session, id=filters.answer_type_id)

    if filters.question_bank_id:
        ensure_question_bank_exists(session=session, id=filters.question_bank_id)
