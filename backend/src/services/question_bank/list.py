from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.models.question import Question
from src.models.question_bank import QuestionBank
from src.models.user import User

from src.core.types import ListResult
from src.api.common.schemas import OrderType
from src.core.database import apply_filter, create_filter

from .common.params import (
    QuestionBankExpand,
    QuestionBankListParams,
    QUESTION_BANK_ORDER_BY_MAP,
)
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
)


def list_question_bank_service(
    session: Session, params: QuestionBankListParams, community_id: int
) -> ListResult[QuestionBank]:
    # base stmt
    stmt = base_select_stmt
    # Adding community wheere clause
    if community_id is not None:
        stmt = stmt.where(QuestionBank.community_id == community_id)
    # filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "created_by": params.filter.created_by,
                "updated_by": params.filter.updated_by,
            }
        ),
        QuestionBank,
    )
    # Search
    if params.filter.search:
        term = params.filter.search.strip()
        if term:
            stmt = stmt.where(QuestionBank.name.ilike(f"%{term}%"))

    # Total count (before joins that may multiply rows)
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Expanding stmnt
    expand_handlers = [
        (QuestionBankExpand.created_by, created_by_expand_stmt),
        (QuestionBankExpand.updated_by, updated_by_expand_stmt),
    ]
    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    # Ordering
    if params.order.order_by:
        column = QUESTION_BANK_ORDER_BY_MAP[params.order.order_by]
        stmt = stmt.order_by(
            column.desc() if params.order.order_type == OrderType.desc else column.asc()
        )

    # Question count join
    question_count_sq = (
        select(
            Question.question_bank_id.label("question_bank_id"),
            func.count(Question.id).label("question_count"),
        )
        .group_by(Question.question_bank_id)
        .subquery()
    )
    stmt = stmt.outerjoin(
        question_count_sq, question_count_sq.c.question_bank_id == QuestionBank.id
    ).add_columns(
        func.coalesce(question_count_sq.c.question_count, 0).label("questions_count")
    )

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)

    question_banks = session.execute(stmt).all()

    return {
        "total_count": total_count,
        "count": len(question_banks),
        "items": question_banks,
    }
