from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.types import ListResult
from src.core.permissions import require_platform_admin
from src.core.database import apply_filter, create_filter


from src.models.user import User
from src.models.community import Community

from .common.params import CommunityListParams, CommunityExpand
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
)
from .common.preconditions import ensure_filter_params_valid


def list_community_service(
    *, session: Session, params: CommunityListParams, current_user: User
) -> ListResult[Community]:

    require_platform_admin(current_user)

    # validating filter list
    ensure_filter_params_valid(session=session, filters=params.filter)

    stmt = base_select_stmt

    # filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "created_by": params.filter.created_by,
                "updated_by": params.filter.updated_by,
            }
        ),
        Community,
    )

    # Search
    if params.filter.search:
        term = params.filter.search.strip()
        if term:
            stmt = stmt.where(Community.name.ilike(f"%{term}%"))

    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Expanding stmnt
    expand_handlers = [
        (CommunityExpand.created_by, created_by_expand_stmt),
        (CommunityExpand.updated_by, updated_by_expand_stmt),
    ]
    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)

    communuties = session.scalars(stmt).all()

    return {"total_count": total_count, "count": len(communuties), "items": communuties}
