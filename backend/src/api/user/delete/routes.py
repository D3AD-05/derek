from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.user.delete import delete_user_service

from . import examples

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to delete a user.
"""


@router.delete(
    "/{user_id}",
    response_model=APIResponse,
    description=DESCRIPTION,
    responses=examples.delete_user_examples,
)
async def delete_user(
    user_id: int,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "User deleted successfully."
    message_500 = "Failed to delete user."

    try:
        delete_user_service(session=session, user_id=user_id, current_user=current_user)

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=None,
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
