from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SubmitAnswerWSIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["submit_answer"]
    question_id: int
    option_id: int | None = None
    option_ids: list[int] | None = None
    answer_status_id: int
    score: int = 0
    time_taken_ms: int = Field(ge=0)
    answer_text: str | None = None
