from sqlalchemy.orm import Session

from src.core.database import transactional
from .common.loaders import get_session_or_raise


def delete_session_service(
    *,
    session: Session,
    session_id: int,
):
    # ensure session exists
    session_data = get_session_or_raise(session=session, id=session_id)

    # ! delete
    with transactional(session):
        session.delete(session_data)
