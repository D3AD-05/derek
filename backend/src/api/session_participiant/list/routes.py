from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.common.guards import get_current_user
from src.api.common.schemas import APIResponse
from src.api.session_participiant.common.out import SessionParticipantOut
from src.api.session.common.out import SessionOut
from src.api.user.common.out import UserOut
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.session_participant.list import list_session_participants_service
from src.services.session_participant.common.params import (
    SessionParticipantsListParams,
    SessionParticipantsExpand,
)
from .dependencies import get_user_list_params


router = APIRouter(prefix="")


DESCRIPTION = """
    Endpoint to list session participants.
"""


@router.get("/", response_model=APIResponse, description=DESCRIPTION)
async def list_session_participiants(
    params: SessionParticipantsListParams = Depends(get_user_list_params),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    message_200 = "Session participants listed successfully."
    message_500 = "Failed to list session participants."

    try:
        session_participiants = list_session_participants_service(
            session=session, params=params, current_user=current_user
        )

        validated_items = []
        for participant in session_participiants["items"]:
            data = SessionParticipantOut.model_validate(participant).model_dump()

            if SessionParticipantsExpand.session in params.expand:
                data["session"] = (
                    SessionOut.model_validate(participant.session).model_dump()
                    if participant.session
                    else None
                )
            if SessionParticipantsExpand.user in params.expand:
                data["user"] = (
                    UserOut.model_validate(participant.user).model_dump()
                    if participant.user
                    else None
                )

            validated_items.append(data)

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=dict(
                total_count=session_participiants["total_count"],
                count=session_participiants["count"],
                items=validated_items,
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
