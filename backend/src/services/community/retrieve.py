from sqlalchemy.orm import Session
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.community import Community
from .common.params import CommunityRetrieveParams, CommunityExpand
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
    users_expand_stmt,
)
from .common.preconditions import ensure_community_exists


def retrieve_community_service(
    *,
    session: Session,
    community_id: int,
    params: CommunityRetrieveParams,
    current_user: User
) -> Community:

    require_platform_admin(current_user)
    ensure_community_exists(session=session, id=community_id)
    stmt = base_select_stmt.where(Community.id == community_id)

    expand_handlers = [
        (CommunityExpand.created_by, created_by_expand_stmt),
        (CommunityExpand.updated_by, updated_by_expand_stmt),
        (CommunityExpand.users, users_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)
    community = session.scalar(stmt)
    print(community)
    return community
