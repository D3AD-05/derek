from pydantic import BaseModel, Field, computed_field, field_validator
from typing import Optional, Union
from datetime import datetime
from src.api.user.common.out import UserOut
from src.api.question_bank.common.out import QuestionBankOut


class AnswerTypeOut(BaseModel):
    id: int
    display_name: str
    code: str

    class Config:
        from_attributes = True


class OptionsOut(BaseModel):
    id: int
    option_text: str
    score: int = 0

    @field_validator("score", mode="before")
    @classmethod
    def _score_none_to_zero(cls, value):
        return 0 if value is None else value

    class Config:
        from_attributes = True


class AnswerTypeOut(BaseModel):
    id: int
    display_name: str
    code: str

    model_config = {"from_attributes": True}


class QuestionOut(BaseModel):
    id: int
    title: str
    # answer_type_id: int
    # answer_type: Optional[AnswerTypeOut] = None
    answer_type: Optional[Union[int, AnswerTypeOut]] = Field(alias="answer_type_id")

    # question_bank_id: int
    # question_bank: Optional[QuestionBankOut] = None
    question_bank: Optional[Union[int, QuestionBankOut]] = Field(
        alias="question_bank_id"
    )

    is_scored: bool
    time_limit_ms: int
    options: list[OptionsOut] = []
    created_by: Optional[Union[int, UserOut]]
    created_at: datetime
    updated_by: Optional[Union[int, UserOut]]
    updated_at: datetime

    is_triggered: bool | None = None  # Added for session_question expansion

    @computed_field(return_type=int)
    @property
    def total_score(self) -> int:
        if not self.is_scored:
            return 0
        return sum((opt.score or 0) for opt in self.options)

    class Config:
        from_attributes = True
