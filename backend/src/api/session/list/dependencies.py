from typing import Optional

from fastapi import Depends, HTTPException, Query
from src.api.session.common import validators
from src.api.common.dependencies import get_expand

from src.services.session.common.params import (
    SessionExpand,
    SessionFilterParams,
    SessionListParams,
    SessionOrderBy,
    SessionOrderParams,
    SessionPaginationParams,
    OrderType,
)

from src.api.user.common.validators import validate_created_by, validate_updated_by
from src.api.session.common.validators import validate_session_status_id
from src.api.community.common.validators import validate_community_id


def get_session_list_params(
    session_status_id: Optional[int] = Depends(validate_session_status_id),
    session_id: Optional[int] = Depends(validators.validate_session_id),
    community_id: Optional[int] = Depends(validate_community_id),
    created_by: Optional[int] = Depends(validate_created_by),
    updated_by: Optional[int] = Depends(validate_updated_by),
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    order_by: Optional[SessionOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    expand: Optional[list[str]] = Depends(get_expand),
    search: Optional[str] = Query(None),
) -> SessionListParams:
    try:
        expand_set = {SessionExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return SessionListParams(
        filter=SessionFilterParams(
            session_status_id=session_status_id,
            community_id=community_id,
            session_id=session_id,
            created_by=created_by,
            updated_by=updated_by,
            search=search,
        ),
        pagination=SessionPaginationParams(limit=limit, offset=offset),
        order=SessionOrderParams(order_by=order_by, order_type=order_type),
        expand=expand_set,
    )
