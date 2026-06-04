from enum import Enum
from typing import Optional

from pydantic import BaseModel
from src.api.common.schemas import OrderType
from src.models.user import User
from src.services.common.params import PaginationParams


class UserFilterParams(BaseModel):
    is_platform_admin: Optional[bool] = None
    user_status_id: Optional[int] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    search: Optional[str] = None


class UserOrderBy(str, Enum):
    id = "id"
    name = "name"  # pyright: ignore[reportIncompatibleMethodOverride, reportAssignmentType]
    email = "email"
    created_at = "created_at"
    updated_at = "updated_at"


USER_ORDER_BY_MAP = {
    UserOrderBy.name: User.name,
    UserOrderBy.email: User.email,
    UserOrderBy.created_at: User.created_at,
    UserOrderBy.updated_at: User.updated_at,
}


class UserOrderParams(BaseModel):
    order_by: Optional[UserOrderBy] = None
    order_type: OrderType = OrderType.asc


class UserExpand(str, Enum):
    user_status = "user_status"
    created_by = "created_by"
    updated_by = "updated_by"
    communities = "communities"


class UserListParams(BaseModel):
    filter: UserFilterParams
    pagination: PaginationParams
    order: UserOrderParams
    expand: set[UserExpand] = set()


class UserRetrieveParams(BaseModel):
    expand: set[UserExpand] = set()
