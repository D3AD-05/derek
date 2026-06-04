from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.api.user.common.out import UserOut, UserStatusOut
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.user.common.params import UserExpand, UserListParams
from src.services.user.list import list_users_service

from . import dependencies, examples

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to list users.
"""


@router.get(
    "/",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.list_users_examples,
)
async def list_users(
    params: UserListParams = Depends(dependencies.get_user_list_params),
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "Users listed successfully."
    message_500 = "Failed to list users."

    try:
        users = list_users_service(
            session=session, params=params, current_user=current_user
        )

        validated_items = []
        for user in users["items"]:
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

            validated_items.append(data)

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=dict(
                total_count=users["total_count"],
                count=users["count"],
                items=validated_items,
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
