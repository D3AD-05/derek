from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr


class UserUpdateRequestBody(BaseModel):
    name: Optional[NotEmptyStr] = Field(None, json_schema_extra={"example": "John Doe"})
    is_platform_admin: Optional[bool] = Field(None, json_schema_extra={"example": True})
    user_status_id: Optional[int] = Field(None, json_schema_extra={"example": 1})
