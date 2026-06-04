from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr


class QuestionBankData(BaseModel):
    name: NotEmptyStr = Field(
        ..., json_schema_extra={"example": "Sample Question Bank"}
    )
    description: Optional[NotEmptyStr] = Field(
        None,
        json_schema_extra={"example": "This is a sample question bank description."},
    )
    community_id: int = Field(..., json_schema_extra={"example": 1})


class QuestionBankUpdateData(BaseModel):
    name: Optional[NotEmptyStr] = Field(
        None,
        json_schema_extra={"example": "Sample name"},
    )
    description: Optional[NotEmptyStr] = Field(
        None,
        json_schema_extra={"example": "This is a sample question bank description."},
    )
