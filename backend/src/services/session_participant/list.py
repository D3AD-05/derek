from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.permissions import require_platform_admin
from src.core.types import ListResult
from src.models.user import User
from src.models.session import SessionParticipant
from .common.params import SessionParticipantsListParams, SessionParticipantsExpand
from .common.preconditions import ensure_filter_params_valid
from .common import statements
from src.core.database import apply_filter, create_filter


def list_session_participants_service(
    *, session: Session, params: SessionParticipantsListParams, current_user: User
) -> ListResult[SessionParticipant]:
    # Auth check
    ensure_filter_params_valid(session=session, data=params.filter)

    stmt = statements.base_select_stmt
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "user_id": params.filter.user_id,
                "session_id": params.filter.session_id,
            }
        ),
        SessionParticipant,
    )

    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Expanding stmnt
    expand_handlers = [
        (SessionParticipantsExpand.session, statements.session_expand_stmt),
        (SessionParticipantsExpand.user, statements.session_user_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)
    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)
    session_participiant_data = session.scalars(stmt).all()

    return {
        "total_count": total_count,
        "count": len(session_participiant_data),
        "items": session_participiant_data,
    }
