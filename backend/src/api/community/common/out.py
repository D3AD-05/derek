from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from src.api.user.common.out import UserOut

class CommunityOut(BaseModel):
    id: int
    name: str
    created_by: Optional[Union[int, UserOut]]
    created_at: datetime
    updated_by: Optional[Union[int, UserOut]]
    updated_at: datetime
    users: Optional[list[UserOut]] = None

    class Config:
        from_attributes = True
