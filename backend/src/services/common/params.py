from typing import Optional

from pydantic import BaseModel


class PaginationParams(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None
