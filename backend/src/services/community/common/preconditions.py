from sqlalchemy.orm import Session
from .loaders import get_community_or_raise
from .params import CommunityFilterParams

from src.services.user.common.preconditions import ensure_user_exists
from src.services.user.common.loaders import validate_user_ids_or_raise


def ensure_community_exists(*, session: Session, id: int) -> None:
    get_community_or_raise(session=session, id=id)


def ensure_filter_params_valid(*, session: Session, filters: CommunityFilterParams):
    if filters.created_by:
        ensure_user_exists(session=session, id=filters.created_by)

    if filters.updated_by:
        ensure_user_exists(session=session, id=filters.updated_by)


def validate_and_add_user_ids(*, session: Session, user_ids: list[int]):
    validate_user_ids = (
        validate_user_ids_or_raise(session=session, user_ids=user_ids)
        if user_ids
        else None
    )
