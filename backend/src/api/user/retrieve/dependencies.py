from typing import Optional

from fastapi import Depends, HTTPException
from src.api.common.dependencies import get_expand
from src.services.user.common.params import UserExpand, UserRetrieveParams


def get_user_retrieve_params(
    expand: Optional[list[str]] = Depends(get_expand),
) -> UserRetrieveParams:
    try:
        expand_set = {UserExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return UserRetrieveParams(expand=expand_set)
