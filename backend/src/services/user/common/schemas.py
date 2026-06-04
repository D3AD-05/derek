from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from src.core.types import NotEmptyStr

class UserStatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"
class UserCreateData(BaseModel):
    name: NotEmptyStr = Field(..., json_schema_extra={"example": "John Doe"})
    email: EmailStr = Field(..., json_schema_extra={"example": "john@example.com"})
    is_platform_admin: Optional[bool] = Field(
        default=False, json_schema_extra={"example": True}
    )
    community_ids:Optional[list[int]] = Field(None, json_schema_extra={"example":[1, 2, 4, 3]})
    user_status_id: int = Field(None, json_schema_extra={"example": 1})



class UserUpdateData(BaseModel):
    name: Optional[NotEmptyStr] = Field(None, json_schema_extra={"example": "John Doe"})
    is_platform_admin: Optional[bool] = Field(None, json_schema_extra={"example": True})
    user_status_id: Optional[int] = Field(None, json_schema_extra={"example": 1})
    community_ids:Optional[list[int]] = Field(None, json_schema_extra={"example":[1, 2, 4, 3]})
