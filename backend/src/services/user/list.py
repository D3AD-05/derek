from sqlalchemy import func, select, or_
from sqlalchemy.orm import Session
from src.api.common.schemas import OrderType
from src.core.database import apply_filter, create_filter
from src.core.permissions import require_platform_admin
from src.core.types import ListResult
from src.models.user import User

from .common.params import USER_ORDER_BY_MAP, UserExpand, UserListParams
from .common.preconditions import ensure_list_params_are_valid
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
    user_status_expand_stmt,
)


def list_users_service(
    *, session: Session, params: UserListParams, current_user: User
) -> ListResult[User]:
    # Auth check
    require_platform_admin(current_user)

    # Preconditions
    ensure_list_params_are_valid(session=session, params=params)

    stmt = base_select_stmt

    # Filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "is_platform_admin": params.filter.is_platform_admin,
                "user_status_id": params.filter.user_status_id,
                "created_by": params.filter.created_by,
                "updated_by": params.filter.updated_by,
            }
        ),
        User,
    )

    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Expand
    expand_handlers = [
        (UserExpand.user_status, user_status_expand_stmt),
        (UserExpand.created_by, created_by_expand_stmt),
        (UserExpand.updated_by, updated_by_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    # Ordering
    if params.order.order_by:
        column = USER_ORDER_BY_MAP[params.order.order_by]
        stmt = stmt.order_by(
            column.desc() if params.order.order_type == OrderType.desc else column.asc()
        )

    # Search
    if params.filter.search:
        term = params.filter.search.strip()
        if term:
            stmt = stmt.where(
                or_(User.name.ilike(f"%{term}%"), User.email.ilike(f"%{term}%"))
            )

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)

    users = session.scalars(stmt).all()

    return {
        "total_count": total_count,
        "count": len(users),
        "items": users,
    }
