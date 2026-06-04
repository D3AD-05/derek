from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User

from src.services.community.retrieve import retrieve_community_service
from src.services.community.common.params import (
    CommunityExpand,
    CommunityRetrieveParams,
)
from src.api.community.common.out import CommunityOut
from src.api.user.common.out import UserOut
from . import dependencies

router = APIRouter(prefix="")

DESCRIPTION = """
    Endpoint to retrieve community.
"""


@router.get(
    "/{community_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    # responses=examples.retrieve_community_examples i
)
async def retrieve_community(
    community_id: int,
    params: CommunityRetrieveParams = Depends(
        dependencies.get_community_retrieve_params
    ),
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "Community retrieved successfully."
    message_500 = "Failed to retrieve community."

    try:
        community = retrieve_community_service(
            session=session,
            community_id=community_id,
            params=params,
            current_user=current_user,
        )
        data = CommunityOut.model_validate(community).model_dump()

        # Expand created_by and updated_by if requested
        expand_fields = {
            "created_by": "created_by_user",
            "updated_by": "updated_by_user",
        }
        for key, attr in expand_fields.items():
            if getattr(CommunityExpand, key) in params.expand:
                data[key] = (
                    UserOut.model_validate(getattr(community, attr)).model_dump()
                    if getattr(community, attr)
                    else None
                )
                # ! FOR MULTIPLE SCHEMAS
                #     expand_fields = {
                #     "created_by": ("created_by_user", UserOut),
                #     "updated_by": ("updated_by_user", UserOut),
                #     "group": ("group_obj", GroupOut),  # Example for a group
                # }
                # for key, (attr, out_schema) in expand_fields.items():
                #     if getattr(CommunityExpand, key) in params.expand:
                #         data[key] = (
                #             out_schema.model_validate(
                #                 getattr(community, attr)
                #             ).model_dump()
                #             if getattr(community, attr)
                #             else None
                #         )

        return APIResponse(status="success", code=200, message=message_200, data=data)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
