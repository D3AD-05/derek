from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.api.community.common.out import CommunityOut

from src.models.user import User
from src.services.community.update import update_community_service
from src.services.community.common.schemas import CommunityUpdateData


router = APIRouter(prefix="")

DESCRIPTION = """
    Endpoint to update community.
"""


@router.patch(
    "/{community_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    # responses=examples.update_community_examples
)
async def update_community(
    request_body: CommunityUpdateData,
    community_id: int,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
    return_data: Optional[bool] = None,
):
    message_200 = "Community updated successfully."
    message_500 = "Failed to update community."
    try:
        update_community = update_community_service(
            data=request_body,
            community_id=community_id,
            current_user=current_user,
            session=session,
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                CommunityOut.model_validate(update_community).model_dump()
                if return_data
                else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
