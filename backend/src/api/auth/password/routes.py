from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.schemas import APIResponse
from src.api.common.guards import get_current_user
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.auth.common.email_SMTP import send_reset_password_email
from src.services.auth.password import (
    change_password_service,
    forgot_password_service,
    reset_password_sevice,
)

router = APIRouter(prefix="/password")
DESCRIPTION = """
    Endpoint to manage password.
"""


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        ...,
    )  # todo - add min_length=6
    new_password: str = Field(
        ...,
    )  # todo - add min_length=6


@router.patch("", response_model=APIResponse, description=DESCRIPTION)
async def change_password(
    request_body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    message_200 = "Password updated successfully."
    message_500 = "Failed to update password."

    try:
        change_password_service(
            session=session,
            user=current_user,
            current_password=request_body.current_password,
            new_password=request_body.new_password,
        )
        return APIResponse(status="success", code=200, message=message_200, data=None)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


@router.post("/forgot-password", response_model=APIResponse, description=DESCRIPTION)
async def forgot_password(
    email: EmailStr,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    message_200 = "Password reset email sent successfully."
    message_500 = "Failed to send password reset email."

    try:
        token, user_email, user_name = forgot_password_service(
            session=session,
            email=email,
        )
        background_tasks.add_task(
            send_reset_password_email,
            token,
            user_email,
            user_name,
        )
        return APIResponse(status="success", code=200, message=message_200, data=None)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


@router.post("/reset_password")
async def reset_password(
    token: str,
    new_password: str,
    session: Session = Depends(get_session),
):
    try:
        reset_password_sevice(session=session, token=token, new_password=new_password)

        return APIResponse(status="success", code=200, message="Password updated")

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")
