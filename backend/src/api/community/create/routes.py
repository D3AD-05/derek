from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError

from src.models.user import User
from src.api.community.common.out import CommunityOut
from src.services.community.create import create_community_service

from . import schemas


router = APIRouter(prefix="")

DESCRIPTION = """
    Endpoint to create community.
"""


@router.post(
    "/",
    response_model=APIResponse,
    description=DESCRIPTION,
    # responses=examples.create_community_examples ,
)
async def create_community(
    request_body: schemas.create_community,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
    return_data: Optional[bool] = None,
):
    message_200 = "Community created successfully."
    message_500 = "Failed to create community."

    try:
        new_community = create_community_service(
            session=session,
            data=request_body.model_dump(mode="python"),
            current_user=current_user,
        )
        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                CommunityOut.model_validate(new_community).model_dump()
                if return_data
                else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
