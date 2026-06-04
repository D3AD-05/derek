from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.api.user.common.out import UserOut
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.user.common.schemas import UserUpdateData
from src.services.user.update import update_user_service

from . import examples, schemas

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to update a user.
"""


@router.patch(
    "/{user_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.update_user_examples,
)
async def update_user(
    request_body: UserUpdateData,
    user_id: int,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
    return_data: Optional[bool] = None,
):
    message_200 = "User updated successfully."
    message_500 = "Failed to update user."

    try:
        updated_user = update_user_service(
            session=session,
            user_id=user_id,
            data=request_body,
            current_user=current_user,
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                UserOut.model_validate(updated_user).model_dump()
                if return_data
                else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
