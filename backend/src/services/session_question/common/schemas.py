from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr
from pydantic import BaseModel, Field
from typing import List


class SessionQuestionItem(BaseModel):
    question_id: int = Field(..., gt=0)
    position: int = Field(..., ge=1)

    class Config:
        from_attributes = True


class CreateSessionQuestionData(BaseModel):
    session_id: int = Field(..., gt=0)
    questions: List[SessionQuestionItem] = Field(..., min_items=1)

    class Config:
        from_attributes = True


class DeleteSessionQuestionData(BaseModel):
    question_ids: Optional[List[int]] = None


class UpdateSessionQuestionItem(BaseModel):
    question_id: int
    position: int


class UpdateSessionQuestionData(BaseModel):
    questions: List[UpdateSessionQuestionItem]
