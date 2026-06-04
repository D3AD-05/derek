from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.types import ListResult
from src.core.permissions import require_platform_admin
from src.core.database import apply_filter, create_filter

from src.models.session import SessionQuestion

from .common.params import (
    SessionQuestionExpand,
    SessionQuestionListParams,
    SessionQuestionOrderBy,
)
from .common.statements import (
    base_select_stmt,
    session_expand_stmt,
    question_expand_stmt,
)
from src.api.common.schemas import OrderType


SESSION_QUESTION_ORDER_BY_MAP = {
    SessionQuestionOrderBy.id: SessionQuestion.id,
    SessionQuestionOrderBy.session_id: SessionQuestion.session_id,
    SessionQuestionOrderBy.position: SessionQuestion.position,
}


def list_session_question_service(
    *,
    session: Session,
    params: SessionQuestionListParams,
) -> ListResult[SessionQuestion]:
    # Auth check

    stmt = base_select_stmt

    # Filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "session_id": params.filter.session_id,
            }
        ),
        SessionQuestion,
    )

    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Expand
    expand_handlers = [
        (SessionQuestionExpand.session, session_expand_stmt),
        (SessionQuestionExpand.question, question_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    # Ordering
    if params.order.order_by:
        column = SESSION_QUESTION_ORDER_BY_MAP[params.order.order_by]
        stmt = stmt.order_by(
            column.desc() if params.order.order_type == OrderType.desc else column.asc()
        )

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)

    items = session.scalars(stmt).all()

    return {
        "total_count": total_count,
        "count": len(items),
        "items": items,
    }
