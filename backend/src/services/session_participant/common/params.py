from pydantic import BaseModel
from enum import Enum
from typing import Optional

from src.api.common.schemas import OrderType


class SessionParticipantsExpand(str, Enum):
    session = "session"
    user = "user"


class SessionParticipantsRetrieveParams(BaseModel):
    expand: set[SessionParticipantsExpand] = set()


class SessionParticipantsPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class SessionParticipantsOrderBy(str, Enum):
    id = "id"
    total_time_taken = "total_time_taken_ms"
    total_score = "total_score"


class SessionParticipantsOrderParams(BaseModel):
    order_by: Optional[SessionParticipantsOrderBy] = None
    order_type: OrderType = OrderType.asc


class SessionParticipantsFilterParams(BaseModel):
    session_id: Optional[int] = None
    user_id: Optional[int] = None


class SessionParticipantsListParams(BaseModel):
    filter: SessionParticipantsFilterParams
    pagination: SessionParticipantsPaginationParams
    order: SessionParticipantsOrderParams
    expand: set[SessionParticipantsExpand] = set()
