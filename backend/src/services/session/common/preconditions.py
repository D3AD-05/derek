from sqlalchemy.orm import Session
from sqlalchemy import or_, select

from .loaders import get_session_or_raise, get_session_status_or_raise

from src.services.user.common.preconditions import ensure_user_exists
from src.services.community.common.preconditions import ensure_community_exists

from .params import SessionFilterParams


def ensure_session_status_exists(*, session: Session, id: int):
    get_session_status_or_raise(session=session, id=id)


def ensure_session_exists(*, session: Session, id: int):
    get_session_or_raise(session=session, id=id)


def ensure_filter_params_valid(*, session: Session, filters: SessionFilterParams):
    if filters.created_by:
        ensure_user_exists(session=session, id=filters.created_by)
    if filters.updated_by:
        ensure_user_exists(session=session, id=filters.updated_by)

    if filters.community_id:
        ensure_community_exists(session=session, id=filters.community_id)

    if filters.session_id:
        ensure_session_exists(session=session, id=filters.session_id)

    if filters.session_status_id:
        ensure_session_status_exists(session=session, id=filters.session_status_id)
