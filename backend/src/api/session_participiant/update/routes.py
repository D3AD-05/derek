from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.common.guards import is_platform_admin
from src.api.common.schemas import APIResponse
from src.api.session_participiant.common.out import SessionParticipantOut
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.session_participant.update import update_session_participant_service
from src.services.session_participant.common.schemas import SessionParticipantUpdate

router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to update a session participant.
"""


@router.patch("/{participant_id}", response_model=APIResponse, description=DESCRIPTION)
async def update_session_participiant(
    request_body: SessionParticipantUpdate,
    participant_id: int,
    current_user: User = Depends(is_platform_admin),
    session: Session = Depends(get_session),
    return_data: Optional[bool] = None,
):
    message_200 = "Session participant updated successfully."
    message_500 = "Failed to update session participant."

    try:
        updated = update_session_participant_service(
            session=session,
            participant_id=participant_id,
            data=request_body,
            current_user=current_user,
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                SessionParticipantOut.model_validate(updated).model_dump()
                if return_data
                else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
