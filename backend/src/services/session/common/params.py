from pydantic import BaseModel
from enum import Enum
from typing import Optional

from src.api.common.schemas import OrderType
from src.models.session import Session as SessionModel


class SessionExpand(str, Enum):
    session_status = "session_status"
    community = "community"
    session_question = "session_question"
    created_by = "created_by"
    updated_by = "updated_by"


class SessionRetrieveParams(BaseModel):
    expand: set[SessionExpand] = set()


class SessionPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class SessionOrderBy(str, Enum):
    id = "id"
    name = "name"
    created_at = "created_at"
    updated_at = "updated_at"


SESSION_ORDER_BY_MAP = {
    SessionOrderBy.id: SessionModel.id,
    SessionOrderBy.created_at: SessionModel.created_at,
    SessionOrderBy.updated_at: SessionModel.updated_at,
}


class SessionOrderParams(BaseModel):
    order_by: Optional[SessionOrderBy] = None
    order_type: OrderType = OrderType.asc


class SessionFilterParams(BaseModel):
    session_status_id: Optional[int] = None
    community_id: Optional[int] = None
    session_id: Optional[int] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    search: Optional[str] = None


class SessionListParams(BaseModel):
    filter: SessionFilterParams
    pagination: SessionPaginationParams
    order: SessionOrderParams
    expand: set[SessionExpand] = set()
