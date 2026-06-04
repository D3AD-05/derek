from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr


class OptionData(BaseModel):
    option_text: str = Field(..., json_schema_extra={"example": "option A"})
    score: int = Field(..., json_schema_extra={"example": 5})

class UpdateOptionData(BaseModel):
    id : Optional[int] = Field(None, json_schema_extra={"example": 1})
    option_text: str = Field(..., json_schema_extra={"example": "option A"})
    score: int = Field(..., json_schema_extra={"example": 5})


class QuestionData(BaseModel):
    question_bank_id: Optional[int] = Field(..., json_schema_extra={"example": 1})

    title: NotEmptyStr = Field(
        ..., json_schema_extra={"example": "What is the capital of India ?"}
    )
    answer_type_id: int = Field(..., json_schema_extra={"example": 1})
    is_scored: bool = Field(None, json_schema_extra={"example": True})
    time_limit_ms: int = Field(..., json_schema_extra={"example": 10000})
    options: Optional[list[OptionData]] = None


class QuestionUpdateData(BaseModel):
    question_bank_id: Optional[int] = Field(None, json_schema_extra={"example": 1})

    title: Optional[NotEmptyStr] = Field(
        None, json_schema_extra={"example": "What is the capital of India?"}
    )

    answer_type_id: Optional[int] = Field(None, json_schema_extra={"example": 1})

    is_scored: Optional[bool] = Field(None, json_schema_extra={"example": True})

    time_limit_ms: Optional[int] = Field(None, json_schema_extra={"example": 10000})
    options: Optional[list[UpdateOptionData]] = None
