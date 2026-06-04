from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.session_participant.delete import delete_session_participant_service

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to delete a session participant.
"""


@router.delete("/{participant_id}", response_model=APIResponse, description=DESCRIPTION)
async def delete_session_participiant(
    participant_id: int,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
):
    message_200 = "Session participant deleted successfully."
    message_500 = "Failed to delete session participant."

    try:
        delete_session_participant_service(
            session=session, participant_id=participant_id, current_user=current_user
        )

        return APIResponse(status="success", code=200, message=message_200, data=None)
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
