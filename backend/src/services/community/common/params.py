from pydantic import BaseModel
from enum import Enum
from typing import Optional
from src.api.common.schemas import OrderType


class CommunityExpand(str, Enum):
    created_by = "created_by"
    updated_by = "updated_by"
    users = "users"


class CommunityRetrieveParams(BaseModel):
    expand: set[CommunityExpand] = set()


class CommunityPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class CommunityOrderBy(str, Enum):
    id = "id"
    name = "name"
    created_at = "created_at"
    updated_at = "updated_at"


class UserOrderParams(BaseModel):
    order_by: Optional[CommunityOrderBy] = None
    order_type: OrderType = OrderType.asc


class CommunityOrderParams(BaseModel):
    order_by: Optional[CommunityOrderBy] = None
    order_type: OrderType = OrderType.asc


class CommunityFilterParams(BaseModel):
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    search: Optional[str] = None


class CommunityListParams(BaseModel):
    filter: CommunityFilterParams
    pagination: CommunityPaginationParams
    order: CommunityOrderParams
    expand: set[CommunityExpand] = set()
