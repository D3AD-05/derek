from typing import Optional

from pydantic import BaseModel, Field
from src.core.types import NotEmptyStr


class CommunityUpdateData(BaseModel):
    name: Optional[NotEmptyStr] = Field(
        None, json_schema_extra={"example": "Updated Community"}
    )
    user_ids: Optional[list[int]] = Field(
        None, json_schema_extra={"example": [13, 12, 1]}
    )
