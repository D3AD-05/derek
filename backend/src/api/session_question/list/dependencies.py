from typing import Optional

from fastapi import Depends, HTTPException, Query
from src.api.common.dependencies import get_expand
from src.api.common.schemas import OrderType

from src.services.session_question.common.params import (
    SessionQuestionExpand,
    SessionQuestionFilterParams,
    SessionQuestionListParams,
    SessionQuestionOrderBy,
    SessionQuestionOrderParams,
    SessionQuestionPaginationParams,
)


def get_session_question_list_params(
    session_id: Optional[int] = Query(None),
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    order_by: Optional[SessionQuestionOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    expand: Optional[list[str]] = Depends(get_expand),
) -> SessionQuestionListParams:
    try:
        expand_set = {SessionQuestionExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return SessionQuestionListParams(
        filter=SessionQuestionFilterParams(session_id=session_id),
        pagination=SessionQuestionPaginationParams(limit=limit, offset=offset),
        order=SessionQuestionOrderParams(order_by=order_by, order_type=order_type),
        expand=expand_set,
    )
