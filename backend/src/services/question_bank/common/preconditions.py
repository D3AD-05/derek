from sqlalchemy.orm import Session
from .loaders import get_QB_or_raise
from .schemas import QuestionBankUpdateData


def ensure_question_bank_exists(*, session: Session, id: int) -> None:
    get_QB_or_raise(session=session, id=id)
