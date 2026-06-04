from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from src.api.user.common.out import UserOut


class QuestionBankOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    community_id: int
    questions_count: int = 0
    created_by: Optional[Union[int, UserOut]]
    created_at: datetime
    updated_by: Optional[Union[int, UserOut]]
    updated_at: datetime

    class Config:
        from_attributes = True
