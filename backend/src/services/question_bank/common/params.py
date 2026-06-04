from pydantic import BaseModel
from enum import Enum
from typing import Optional
from src.api.common.schemas import OrderType
from src.models.user import User
from src.models.question_bank import QuestionBank


class QuestionBankExpand(str, Enum):
    community = "community"
    created_by = "created_by"
    updated_by = "updated_by"


class QuestionBankRetrieveParams(BaseModel):
    expand: set[QuestionBankExpand] = set()


class QuestionBankPaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None


class QuestionBankOrderBy(str, Enum):
    id = "id"
    name = "name"
    created_at = "created_at"
    updated_at = "updated_at"


QUESTION_BANK_ORDER_BY_MAP = {
    QuestionBankOrderBy.id: QuestionBank.id,
    QuestionBankOrderBy.name: QuestionBank.name,
    QuestionBankOrderBy.created_at: QuestionBank.created_at,
    QuestionBankOrderBy.updated_at: QuestionBank.updated_at,
}


class QuestionBankOrderParams(BaseModel):
    order_by: Optional[QuestionBankOrderBy] = None
    order_type: OrderType = OrderType.asc


class QuestionBankFilterParams(BaseModel):
    search: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None


class QuestionBankListParams(BaseModel):
    filter: QuestionBankFilterParams
    pagination: QuestionBankPaginationParams
    order: QuestionBankOrderParams
    expand: set[QuestionBankExpand] = set()
