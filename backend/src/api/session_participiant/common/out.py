from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, Field

from src.api.session.common.out import SessionOut
from src.api.user.common.out import UserOut


class SessionParticipantOut(BaseModel):
    id: int
    session: Union[int, SessionOut] = Field(alias="session_id")
    user: Union[int, UserOut] = Field(alias="user_id")
    total_score: int
    total_time_taken_ms: int

    class Config:
        from_attributes = True
        populate_by_name = True
