from typing import Optional

from fastapi import Depends, HTTPException
from src.api.common.dependencies import get_expand
from src.services.community.common.params import (
    CommunityExpand,
    CommunityRetrieveParams,
)


def get_community_retrieve_params(
    expand: Optional[list[str]] = Depends(get_expand),
) -> CommunityRetrieveParams:
    try:
        expand_set = {CommunityExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return CommunityRetrieveParams(expand=expand_set)
