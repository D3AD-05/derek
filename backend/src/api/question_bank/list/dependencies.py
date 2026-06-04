from typing import Optional

from fastapi import Depends, HTTPException, Query

from src.api.user.common import validators
from src.api.common.dependencies import get_expand

from src.services.question_bank.common.params import (
    QuestionBankExpand,
    QuestionBankFilterParams,
    QuestionBankListParams,
    QuestionBankOrderBy,
    QuestionBankOrderParams,
    QuestionBankPaginationParams,
    OrderType,
)


def get_question_bank_list_params(
    # Filters
    created_by: Optional[int] = Depends(validators.validate_created_by),
    updated_by: Optional[int] = Depends(validators.validate_updated_by),
    search: Optional[str] = Query(None),
    # Pagination
    # Pagination
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    # Ordering
    order_by: Optional[QuestionBankOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    # Expand
    expand: Optional[list[str]] = Depends(get_expand),
) -> QuestionBankListParams:
    try:
        expand_set = {QuestionBankExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return QuestionBankListParams(
        filter=QuestionBankFilterParams(
            search=search,
            created_by=created_by,
            updated_by=updated_by,
        ),
        pagination=QuestionBankPaginationParams(
            limit=limit,
            offset=offset,
        ),
        order=QuestionBankOrderParams(
            order_by=order_by,
            order_type=order_type,
        ),
        expand=expand_set,
    )
