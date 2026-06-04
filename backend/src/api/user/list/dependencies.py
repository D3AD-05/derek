from typing import Optional

from fastapi import Depends, HTTPException, Query
from src.api.common.dependencies import get_expand
from src.api.common.schemas import OrderType
from src.api.user.common import validators
from src.services.common.params import PaginationParams
from src.services.user.common.params import (
    UserExpand,
    UserFilterParams,
    UserListParams,
    UserOrderBy,
    UserOrderParams,
)


def get_user_list_params(
    # Filters
    is_platform_admin: Optional[bool] = Query(None),
    user_status_id: Optional[int] = Depends(validators.validate_user_status_id),
    created_by: Optional[int] = Depends(validators.validate_created_by),
    updated_by: Optional[int] = Depends(validators.validate_updated_by),
    # Pagination
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    # Ordering
    order_by: Optional[UserOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    # Expand
    expand: Optional[list[str]] = Depends(get_expand),
    search: Optional[str] = Query(None),
) -> UserListParams:
    try:
        expand_set = {UserExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return UserListParams(
        filter=UserFilterParams(
            is_platform_admin=is_platform_admin,
            user_status_id=user_status_id,
            created_by=created_by,
            updated_by=updated_by,
            search=search,
        ),
        pagination=PaginationParams(
            limit=limit,
            offset=offset,
        ),
        order=UserOrderParams(
            order_by=order_by,
            order_type=order_type,
        ),
        expand=expand_set,
    )
