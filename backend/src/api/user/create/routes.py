from typing import Optional

from fastapi import APIRouter, BackgroundTasks,Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.api.user.common.out import UserOut
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.user.common.schemas import UserCreateData
from src.services.user.create import create_user_service
from src.services.auth.common.email_SMTP import send_set_password_email
from . import examples

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to create a user.
"""


@router.post(
    "/",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.create_user_example,
)
async def create_user(
    background_tasks: BackgroundTasks, # Send set password email
    request_body: UserCreateData,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
    return_data: Optional[bool] = None,
):
    message_200 = "User created successfully."
    message_500 = "Failed to create user."

    try:
        token,new_user = create_user_service(
            session=session,
            data=request_body,
            current_user=current_user,
        )

        background_tasks.add_task(
            send_set_password_email,
            token,
            new_user.email,
            new_user.name,
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                UserOut.model_validate(new_user).model_dump() if return_data else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
