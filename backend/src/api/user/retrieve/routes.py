from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.api.common.guards import get_current_user, is_platform_admin
from src.api.common.schemas import APIResponse
from src.api.user.common.out import UserOut, UserStatusOut
from src.api.community.common.out import CommunityOut

from src.api.user.common.validators import validate_user_id
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.models.community import Community, CommunityUser
from src.services.user.common.params import UserExpand, UserRetrieveParams
from src.services.user.retrieve import retrieve_user_service,retrieve_user_status_service
from . import dependencies, examples

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to retrieve a user.
"""

@router.get(
    "/status",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.retrieve_user_examples,
)
async def get_user_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    message_200 = "User retrieved successfully."
    message_500 = "Failed to retrieve user."

    try:
        status = retrieve_user_status_service(
            session=session,
        )

        data = [UserStatusOut.model_validate(status) for status in status]

   
        return APIResponse(status="success", code=200, message=message_200, data=data)

    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


@router.get(
    "/me",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.retrieve_user_examples,
)
async def get_me(
    current_user: User = Depends(get_current_user),
    params: UserRetrieveParams = Depends(dependencies.get_user_retrieve_params),
    session: Session = Depends(get_session),
):
    message_200 = "User retrieved successfully."
    message_500 = "Failed to retrieve user."

    try:
        user = retrieve_user_service(
            session=session,
            user_id=current_user.id,
            current_user=current_user,
            params=params,
        )

        data = UserOut.model_validate(user).model_dump()

        if UserExpand.user_status in params.expand:
            data["user_status"] = UserStatusOut.model_validate(
                user.user_status
            ).model_dump()

        if UserExpand.created_by in params.expand:
            data["created_by"] = (
                UserOut.model_validate(user.created_by_user).model_dump()
                if user.created_by_user
                else None
            )

        if UserExpand.updated_by in params.expand:
            data["updated_by"] = (
                UserOut.model_validate(user.updated_by_user).model_dump()
                if user.updated_by_user
                else None
            )

        if UserExpand.communities in params.expand:
            communities = session.scalars(
                select(Community)
                .join(CommunityUser, Community.id == CommunityUser.community_id)
                .where(CommunityUser.user_id == user.id)
            ).all()
            data["communities"] = [
                CommunityOut.model_validate(community).model_dump()
                for community in communities
            ]

        return APIResponse(status="success", code=200, message=message_200, data=data)

    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


@router.get(
    "/{user_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.retrieve_user_examples,
)
async def retrieve_user(
    user_id: int = Depends(validate_user_id),
    params: UserRetrieveParams = Depends(dependencies.get_user_retrieve_params),
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "User retrieved successfully."
    message_500 = "Failed to retrieve user."

    try:
        user = retrieve_user_service(
            session=session, user_id=user_id, params=params, current_user=current_user
        )

        data = UserOut.model_validate(user).model_dump()

        if UserExpand.user_status in params.expand:
            data["user_status"] = UserStatusOut.model_validate(
                user.user_status
            ).model_dump()

        if UserExpand.created_by in params.expand:
            data["created_by"] = (
                UserOut.model_validate(user.created_by_user).model_dump()
                if user.created_by_user
                else None
            )

        if UserExpand.updated_by in params.expand:
            data["updated_by"] = (
                UserOut.model_validate(user.updated_by_user).model_dump()
                if user.updated_by_user
                else None
            )

        if UserExpand.communities in params.expand:
            communities = session.scalars(
                select(Community)
                .join(CommunityUser, Community.id == CommunityUser.community_id)
                .where(CommunityUser.user_id == user.id)
            ).all()
            data["communities"] = [
                CommunityOut.model_validate(community).model_dump()
                for community in communities
            ]

        return APIResponse(status="success", code=200, message=message_200, data=data)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)



@router.get(
    "/{user_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.retrieve_user_examples,
)
async def retrieve_user(
    user_id: int = Depends(validate_user_id),
    params: UserRetrieveParams = Depends(dependencies.get_user_retrieve_params),
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "User retrieved successfully."
    message_500 = "Failed to retrieve user."

    try:
        user = retrieve_user_service(
            session=session, user_id=user_id, params=params, current_user=current_user
        )

        data = UserOut.model_validate(user).model_dump()

        if UserExpand.user_status in params.expand:
            data["user_status"] = UserStatusOut.model_validate(
                user.user_status
            ).model_dump()

        if UserExpand.created_by in params.expand:
            data["created_by"] = (
                UserOut.model_validate(user.created_by_user).model_dump()
                if user.created_by_user
                else None
            )

        if UserExpand.updated_by in params.expand:
            data["updated_by"] = (
                UserOut.model_validate(user.updated_by_user).model_dump()
                if user.updated_by_user
                else None
            )

        if UserExpand.communities in params.expand:
            communities = session.scalars(
                select(Community)
                .join(CommunityUser, Community.id == CommunityUser.community_id)
                .where(CommunityUser.user_id == user.id)
            ).all()
            data["communities"] = [
                CommunityOut.model_validate(community).model_dump()
                for community in communities
            ]

        return APIResponse(status="success", code=200, message=message_200, data=data)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


