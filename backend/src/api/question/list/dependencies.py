from typing import Optional

from fastapi import Depends, HTTPException, Query
from src.api.question.common import validators
from src.api.common.dependencies import get_expand
from src.api.user.common import validators

from src.services.question.common.params import (
    QuestionExpand,
    QuestionFilterParams,
    QuestionListParams,
    QuestionOrderBy,
    QuestionOrderParams,
    QuestionPaginationParams,
    OrderType,
)


def get_question_list_params(
    question_bank_id: Optional[int] = Query(None),  # todo validate
    answer_type_id: Optional[int] = Query(None),  # todo validata
    created_by: Optional[int] = Depends(validators.validate_created_by),
    updated_by: Optional[int] = Depends(validators.validate_updated_by),
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    order_by: Optional[QuestionOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    expand: Optional[list[str]] = Depends(get_expand),
    search: Optional[str] = Query(None),
) -> QuestionListParams:
    try:
        expand_set = {QuestionExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return QuestionListParams(
        filter=QuestionFilterParams(
            question_bank_id=question_bank_id,
            answer_type_id=answer_type_id,
            created_by=created_by,
            updated_by=updated_by,
            search=search,
        ),
        pagination=QuestionPaginationParams(limit=limit, offset=offset),
        order=QuestionOrderParams(order_by=order_by, order_type=order_type),
        expand=expand_set,
    )
