from typing import Optional

from fastapi import Depends, HTTPException, Query

from src.api.user.common import validators
from src.api.common.dependencies import get_expand

from src.services.community.common.params import (
    CommunityExpand,
    CommunityFilterParams,
    CommunityListParams,
    CommunityOrderBy,
    CommunityOrderParams,
    CommunityPaginationParams,
    OrderType,
)


def get_community_list_params(
    # Filters
    created_by: Optional[int] = Depends(validators.validate_created_by),
    updated_by: Optional[int] = Depends(validators.validate_updated_by),
    # Pagination
    # Pagination
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    # Ordering
    order_by: Optional[CommunityOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    # Expand
    expand: Optional[list[str]] = Depends(get_expand),
) -> CommunityListParams:
    try:
        expand_set = {CommunityExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return CommunityListParams(
        filter=CommunityFilterParams(
            created_by=created_by,
            updated_by=updated_by,
            search=search,
        ),
        pagination=CommunityPaginationParams(
            limit=limit,
            offset=offset,
        ),
        order=CommunityOrderParams(
            order_by=order_by,
            order_type=order_type,
        ),
        expand=expand_set,
    )
