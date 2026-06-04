import enum
from typing import Any, Optional

from pydantic import BaseModel


# Core API Response
class APIResponse(BaseModel):
    status: str
    code: int
    message: str
    data: Optional[Any] = None


class OrderType(str, enum.Enum):
    desc = "desc"
    asc = "asc"
