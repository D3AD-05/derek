from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.common.guards import get_current_user
from src.api.common.schemas import APIResponse
from src.core.database import get_session
from src.core.exceptions import ServiceError
from src.models.user import User
from src.services.session.leaderboard import get_session_leaderboard

router = APIRouter(prefix="")


@router.get(
    "/{session_id}/leaderboard",
    response_model=APIResponse,
    description="Get full leaderboard (rank, name, score) for a session.",
)
async def get_leaderboard(
    session_id: int,
    session: Session = Depends(get_session),
):
    message_200 = "Leaderboard retrieved successfully."
    message_500 = "Failed to retrieve leaderboard."

    try:
        items = get_session_leaderboard(session=session, session_id=session_id)
        return APIResponse(
            status="success",
            code=200,
            message=message_200,
            data={"session_id": int(session_id), "items": items},
        )
    except ServiceError:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=message_500)
