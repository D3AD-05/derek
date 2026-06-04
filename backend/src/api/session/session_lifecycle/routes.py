import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.common.schemas import APIResponse
from src.api.common.guards import get_current_user
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.core.ws import ws_manager
from src.models.user import User
from src.services.session.update import (
    update_session_status,
)
from src.services.session.common.schemas import SessionUpdateData
from ..common.out import SessionOut

router = APIRouter(prefix="")


@router.patch(
    "/{session_id}/start",
    response_model=APIResponse,
    description="Start a live (ongoing) session.",
)
async def start_live_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    return_data: bool | None = None,
):
    message_200 = "Session started successfully."
    message_500 = "Failed to start session."

    try:
        result = update_session_status(
            session=session,
            session_id=session_id,
            current_user=current_user,
            transition="start",
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                SessionOut.model_validate(result).model_dump() if return_data else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)


@router.patch(
    "/{session_id}/end",
    response_model=APIResponse,
    description="End a live (ongoing) session.",
)
async def end_live_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    return_data: bool | None = None,
):
    message_200 = "Session ended successfully."
    message_500 = "Failed to end session."

    try:
        result = update_session_status(
            session=session,
            session_id=session_id,
            current_user=current_user,
            transition="end",
        )

        await ws_manager.broadcast_text(
            str(session_id),
            json.dumps(
                {"type": "session_ended", "session_status": 3}
            ),  # TODO status not needed
        )

        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data=(
                SessionOut.model_validate(result).model_dump() if return_data else None
            ),
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
