from sqlalchemy.orm import Session
from src.core.permissions import require_platform_admin
from src.models.user import User,UserStatus

from .common.params import UserExpand, UserRetrieveParams
from .common.preconditions import ensure_user_exists
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
    user_status_expand_stmt,
)
from sqlalchemy import select

def retrieve_user_service(
    *, session: Session, user_id: int, params: UserRetrieveParams, current_user: User
) -> User:

    # Preconditions
    ensure_user_exists(session=session, id=user_id)

    stmt = base_select_stmt.where(User.id == user_id)

    # Expansions (DB-level only)
    if UserExpand.user_status in params.expand:
        stmt = user_status_expand_stmt(stmt)

    if UserExpand.created_by in params.expand:
        stmt = created_by_expand_stmt(stmt)

    if UserExpand.updated_by in params.expand:
        stmt = updated_by_expand_stmt(stmt)

    user = session.scalar(stmt)

    return user


def retrieve_user_status_service(*, session: Session) -> list[UserStatus]:
    stmt = select(UserStatus)
    return session.scalars(stmt).all()