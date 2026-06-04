from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr
from src.services.session_question.common.schemas import SessionQuestionItem


class SessionCreateData(BaseModel):
    name: NotEmptyStr = Field(..., json_schema_extra={"example": "Weekly Quiz Session"})
    venue: NotEmptyStr = Field(..., json_schema_extra={"example": "Community Hall A"})
    community_id: int = Field(..., json_schema_extra={"example": 1})
    session_status_id: int = Field(..., json_schema_extra={"example": 1})
    questions: list[SessionQuestionItem] = Field(
        ...,
        min_items=1,
        json_schema_extra={
            "example": [
                {"question_id": 91, "position": 1},
                {"question_id": 81, "position": 2},
            ]
        },
    )


class SessionUpdateData(BaseModel):
    name: Optional[NotEmptyStr] = Field(
        None, json_schema_extra={"example": "Monthly Quiz Session"}
    )
    venue: Optional[NotEmptyStr] = Field(
        None, json_schema_extra={"example": "Auditorium"}
    )
    session_status_id: Optional[int] = Field(None, json_schema_extra={"example": 2})
    questions: Optional[list[SessionQuestionItem]] = Field(
        None,
        min_items=1,
        json_schema_extra={
            "example": [
                {"question_id": 91, "position": 1},
                {"question_id": 81, "position": 2},
            ]
        },
    )
