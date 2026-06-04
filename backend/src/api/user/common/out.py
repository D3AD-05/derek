from __future__ import annotations

from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, EmailStr, Field


class UserStatusOut(BaseModel):
    id: int
    code: str
    display_name: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_platform_admin: bool
    user_status: Union[int, UserStatusOut] = Field(alias="user_status_id")
    password_updated_at: Optional[datetime]
    created_by: Optional[Union[int, UserOut]]
    created_at: datetime
    updated_by: Optional[Union[int, UserOut]]
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
