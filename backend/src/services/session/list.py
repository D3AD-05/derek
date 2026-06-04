from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.database import apply_filter, create_filter
from src.core.types import ListResult

from src.models.user import User
from src.models.question import Option, Question
from src.models.session import (
    Session as SessionModel,
    SessionStatus,
    SessionParticipant,
    SessionQuestion,
    AnswerStatus,
)


# from src.api.session.common.out import SessionStatusCountsOut

from src.api.common.schemas import OrderType
from .common.params import SessionListParams, SessionExpand, SESSION_ORDER_BY_MAP
from .common.preconditions import ensure_filter_params_valid
from .common import statements
from .common.loaders import get_session_status_or_raise


def list_session_service(
    *,
    session: Session,
    params: SessionListParams,
    current_user: User,
    community_id: int,
) -> ListResult[SessionModel]:
    # require_platform_admin(current_user)
    stmt = statements.base_select_stmt
    # Adding community_id
    if community_id is not None:
        stmt = stmt.where(SessionModel.community_id == community_id)

    # validating filter
    ensure_filter_params_valid(session=session, filters=params.filter)
    # filters
    stmt = apply_filter(
        stmt,
        create_filter(
            {
                # "community_id": params.filter.community_id, #! Removing because added from header
                "id": params.filter.session_id,
                "session_status_id": params.filter.session_status_id,
                "created_by": params.filter.created_by,
                "updated_by": params.filter.updated_by,
            }
        ),
        SessionModel,
    )

    filtered_stmt = stmt
    # Total count
    total_count: int = (
        session.scalar(select(func.count()).select_from(filtered_stmt.subquery())) or 0
    )

    # Expanding stmnt
    expand_handlers = [
        (SessionExpand.created_by, statements.created_by_expand_stmt),
        (SessionExpand.updated_by, statements.updated_by_expand_stmt),
        (SessionExpand.session_status, statements.session_status_expand_stmt),
        (SessionExpand.session_question, statements.session_question_expand_stmt),
        (SessionExpand.community, statements.community_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    participant_count_sq = (
        select(
            SessionParticipant.session_id.label("session_id"),
            func.count(SessionParticipant.id).label("participant_count"),
        )
        .group_by(SessionParticipant.session_id)
        .subquery()
    )

    question_count_sq = (
        select(
            SessionQuestion.session_id.label("session_id"),
            func.count(SessionQuestion.id).label("question_count"),
        )
        .group_by(SessionQuestion.session_id)
        .subquery()
    )

    total_score_sq = (
        select(
            SessionQuestion.session_id.label("session_id"),
            func.coalesce(func.sum(Option.score), 0).label("total_score"),
        )
        .select_from(SessionQuestion)
        .join(Option, Option.question_id == SessionQuestion.question_id)
        .group_by(SessionQuestion.session_id)
        .subquery()
    )

    total_time_limit_ms_sq = (
        select(
            SessionQuestion.session_id.label("session_id"),
            func.coalesce(func.sum(Question.time_limit_ms), 0).label(
                "total_time_limit_ms"
            ),
        )
        .select_from(SessionQuestion)
        .join(Question, Question.id == SessionQuestion.question_id)
        .group_by(SessionQuestion.session_id)
        .subquery()
    )

    stmt = (
        stmt.outerjoin(
            participant_count_sq, participant_count_sq.c.session_id == SessionModel.id
        )
        .outerjoin(question_count_sq, question_count_sq.c.session_id == SessionModel.id)
        .outerjoin(total_score_sq, total_score_sq.c.session_id == SessionModel.id)
        .outerjoin(
            total_time_limit_ms_sq,
            total_time_limit_ms_sq.c.session_id == SessionModel.id,
        )
        .add_columns(
            func.coalesce(participant_count_sq.c.participant_count, 0).label(
                "participant_count"
            ),
            func.coalesce(question_count_sq.c.question_count, 0).label(
                "question_count"
            ),
            func.coalesce(total_score_sq.c.total_score, 0).label("total_score"),
            func.coalesce(total_time_limit_ms_sq.c.total_time_limit_ms, 0).label(
                "total_time_ms"
            ),
        )
    )

    # Ordering
    if params.order.order_by:
        column = SESSION_ORDER_BY_MAP[params.order.order_by]
        stmt = stmt.order_by(
            column.desc() if params.order.order_type == OrderType.desc else column.asc()
        )

    # Search
    if params.filter.search:
        term = params.filter.search.strip()
        if term:
            stmt = stmt.where(SessionModel.name.ilike(f"%{term}%"))

    # Pagination
    if params.pagination.limit is not None:
        stmt = stmt.limit(params.pagination.limit)

    if params.pagination.offset is not None:
        stmt = stmt.offset(params.pagination.offset)

    rows = session.execute(stmt).all()
    session_data: list[SessionModel] = []
    for (
        session_obj,
        participant_count,
        question_count,
        total_score,
        total_time,
    ) in rows:
        session_obj.participant_count = int(participant_count or 0)
        session_obj.question_count = int(question_count or 0)
        session_obj.total_score = int(total_score or 0)
        session_obj.total_time_ms = int(total_time or 0)
        session_data.append(session_obj)

    return {
        "total_count": total_count,
        "count": len(session_data),
        "items": session_data,
    }


def get_session_status_service(*, session: Session) -> list[SessionStatus]:
    stmt = select(SessionStatus)
    return session.scalars(stmt).all()


def session_status_counts_service(
    *,
    session: Session,
    community_id: int,
):
    upcoming_status = get_session_status_or_raise(session=session, code="upcoming")
    ongoing_status = get_session_status_or_raise(session=session, code="ongoing")
    completed_status = get_session_status_or_raise(session=session, code="completed")

    stmt = select(
        func.count(SessionModel.id).label("all"),
        func.count()
        .filter(SessionModel.session_status_id == upcoming_status.id)
        .label("upcoming"),
        func.count()
        .filter(SessionModel.session_status_id == ongoing_status.id)
        .label("ongoing"),
        func.count()
        .filter(SessionModel.session_status_id == completed_status.id)
        .label("completed"),
    ).where(SessionModel.community_id == community_id)

    counts = session.execute(stmt).one()
    result = {
        "all": counts.all,
        "upcoming": counts.upcoming,
        "ongoing": counts.ongoing,
        "completed": counts.completed,
    }

    return result


def get_answer_status_service(*, session: Session) -> list[AnswerStatus]:
    stmt = select(AnswerStatus)
    return session.scalars(stmt).all()
