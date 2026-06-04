from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, Field

from src.api.community.common.out import CommunityOut
from src.api.user.common.out import UserOut


class SessionQuestionExpandedOut(BaseModel):
    id: int
    title: str
    answer_type: int
    question_bank: Optional[int] = None
    is_scored: bool
    time_limit_ms: Optional[int] = None

    model_config = {"from_attributes": True}


class SessionStatusOut(BaseModel):
    id: int
    code: str
    display_name: str

    model_config = {"from_attributes": True}


class AnswerStatusOut(BaseModel):
    id: int
    code: str
    display_name: str

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    id: int
    name: str
    venue: str
    community: Optional[Union[int, CommunityOut]] = Field(alias="community_id")
    session_status: Optional[Union[int, SessionStatusOut]] = Field(
        alias="session_status_id"
    )
    created_by: Optional[Union[int, UserOut]]
    created_at: datetime
    updated_by: Optional[Union[int, UserOut]]

    updated_at: datetime

    participant_count: Optional[int] = None
    question_count: Optional[int] = None
    total_score: Optional[int] = None
    total_time_ms: Optional[int] = None

    questions: Optional[list[SessionQuestionExpandedOut]] = None

    model_config = {"from_attributes": True}


class SessionStatusCountsOut(BaseModel):
    all: int
    upcoming: int
    ongoing: int
    completed: int
