from pydantic import BaseModel
from enum import Enum
from typing import Optional

from src.api.common.schemas import OrderType
from src.models.question import Question


class QuestionExpand(str, Enum):
    question_bank = "question_bank"
    answer_type = "answer_type"
    created_by = "created_by"
    updated_by = "updated_by"


class QuestionRetrieveParams(BaseModel):
    expand: set[QuestionExpand] = set()


class QuestionPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class QuestionOrderBy(str, Enum):
    id = "id"
    created_at = "created_at"
    updated_at = "updated_at"


QUESTION_ORDER_BY_MAP = {
    QuestionOrderBy.id: Question.id,
    QuestionOrderBy.created_at: Question.created_at,
    QuestionOrderBy.updated_at: Question.updated_at,
}


class QuestionOrderParams(BaseModel):
    order_by: Optional[QuestionOrderBy] = None
    order_type: OrderType = OrderType.asc


class QuestionFilterParams(BaseModel):
    answer_type_id: Optional[int] = None
    question_bank_id: Optional[int] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    search: Optional[str] = None


class QuestionListParams(BaseModel):
    filter: QuestionFilterParams
    pagination: QuestionPaginationParams
    order: QuestionOrderParams
    expand: set[QuestionExpand] = set()
