from pydantic import BaseModel
from enum import Enum
from typing import Optional

from src.api.common.schemas import OrderType


class SessionQuestionExpand(str, Enum):
    session = "session"
    question = "question"


class SessionQuestionRetrieveParams(BaseModel):
    expand: set[SessionQuestionExpand] = set()


class SessionQuestionPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class SessionQuestionOrderBy(str, Enum):
    id = "id"
    session_id = "session_id"
    position = "position"


class SessionQuestionOrderParams(BaseModel):
    order_by: Optional[SessionQuestionOrderBy] = None
    order_type: OrderType = OrderType.asc


class SessionQuestionFilterParams(BaseModel):
    session_id: Optional[int] = None


class SessionQuestionListParams(BaseModel):
    filter: SessionQuestionFilterParams
    pagination: SessionQuestionPaginationParams
    order: SessionQuestionOrderParams
    expand: set[SessionQuestionExpand] = set()
