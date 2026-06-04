from typing import Optional

from pydantic import BaseModel, EmailStr, Field
from src.core.types import NotEmptyStr


class SessionParticipantCreate(BaseModel):
    session_id: int = Field(
        ...,
        json_schema_extra={"example": 12},
    )

    user_id: int = Field(
        ...,
        json_schema_extra={"example": 45},
    )


class SessionParticipantUpdate(BaseModel):
    total_score: Optional[int] = Field(
        None,
        json_schema_extra={"example": 150},
    )

    total_time_taken_ms: Optional[int] = Field(
        None,
        json_schema_extra={"example": 120000},
    )


class SessionParticipantJoinByLink(BaseModel):
    name: NotEmptyStr = Field(..., json_schema_extra={"example": "Jane Doe"})
    email: EmailStr = Field(..., json_schema_extra={"example": "jane@example.com"})
