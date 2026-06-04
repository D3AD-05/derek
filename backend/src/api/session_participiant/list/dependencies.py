from typing import Optional

from fastapi import Depends, HTTPException, Query
from src.api.common.dependencies import get_expand
from src.api.common.schemas import OrderType

from src.services.session_participant.common import params
from src.api.session.common.validators import validate_session_id
from src.api.user.common.validators import validate_user_id_query

# from src.api.session_participiant.common import validators


def get_user_list_params(
    # Filters
    user_id: Optional[int] = Depends(validate_user_id_query),
    session_id: Optional[int] = Depends(validate_session_id),
    # Pagination
    limit: int = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    # Ordering
    order_by: Optional[params.SessionParticipantsOrderBy] = Query(None),
    order_type: OrderType = Query(OrderType.asc),
    # Expand
    expand: Optional[list[str]] = Depends(get_expand),
) -> params.SessionParticipantsListParams:
    try:
        expand_set = (
            {params.SessionParticipantsExpand(e) for e in expand} if expand else set()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return params.SessionParticipantsListParams(
        filter=params.SessionParticipantsFilterParams(
            user_id=user_id,
            session_id=session_id,
        ),
        pagination=params.SessionParticipantsPaginationParams(
            limit=limit,
            offset=offset,
        ),
        order=params.SessionParticipantsOrderParams(
            order_by=order_by,
            order_type=order_type,
        ),
        expand=expand_set,
    )
