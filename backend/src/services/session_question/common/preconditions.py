from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from .loaders import get_session_question_or_raise


def ensure_session_question_exists(*, session: Session, id: int):
    get_session_question_or_raise(session=session, id=id)
