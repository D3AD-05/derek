from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.types import ListResult
from src.core.permissions import require_platform_admin
from src.core.database import apply_filter, create_filter
from src.api.common.schemas import OrderType

from src.models.user import User
from src.models.question import Question, Option, AnswerType


from .common.params import QUESTION_ORDER_BY_MAP, QuestionListParams, QuestionExpand
from .common.preconditions import ensure_filter_params_valid
from .common import statements


def list_question_service(
    *, session: Session, params: QuestionListParams, current_user: User
) -> ListResult[Question]:
    stmt = statements.base_select_stmt
    # validating filter
    ensure_filter_params_valid(session=session, filters=params.filter)

    # filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                "answer_type_id": params.filter.answer_type_id,
                "created_by": params.filter.created_by,
                "updated_by": params.filter.updated_by,
                "question_bank_id": params.filter.question_bank_id,
            }
        ),
        Question,
    )
    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    )

    # Total Score stmt
    total_score_subq = (
        select(Option.question_id, func.sum(Option.score).label("total_score"))
        .group_by(Option.question_id)
        .subquery()
    )

    stmt = stmt.outerjoin(
        total_score_subq,
        total_score_subq.c.question_id == Question.id,
    ).add_columns(total_score_subq.c.total_score)

    # Expanding stmnt
    expand_handlers = [
        (QuestionExpand.created_by, statements.created_by_expand_stmt),
        (QuestionExpand.updated_by, statements.updated_by_expand_stmt),
        (QuestionExpand.answer_type, statements.answer_type_expand_stmt),
        (QuestionExpand.question_bank, statements.question_bank_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    # Ordering
    if params.order.order_by:
        column = QUESTION_ORDER_BY_MAP[params.order.order_by]
        stmt = stmt.order_by(
            column.desc() if params.order.order_type == OrderType.desc else column.asc()
        )

    # Search
    if params.filter.search:
        term = params.filter.search.strip()
        if term:
            stmt = stmt.where(Question.title.ilike(f"%{term}%"))

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)
    rows = session.execute(stmt).all()

    questions = []
    for question, total_score in rows:
        question.total_score = total_score or 0
        questions.append(question)

    return {"total_count": total_count, "count": len(questions), "items": questions}


def get_answer_type_service(*, session: Session) -> list[AnswerType]:
    stmt = select(AnswerType)
    return session.scalars(stmt).all()
