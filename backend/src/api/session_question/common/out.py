from pydantic import BaseModel


class SessionQuestionOut(BaseModel):
    id: int
    session_id: int
    question_id: int
    position: int

    class Config:
        from_attributes = True
