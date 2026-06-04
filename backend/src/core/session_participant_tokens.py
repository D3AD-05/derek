from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict

from src.core.config import settings
from src.core.exceptions import AuthenticationError
from src.core.utils import create_token, decode_token


class SessionParticipantTokenClaims(BaseModel):
    model_config = ConfigDict(extra="ignore")

    typ: Literal["session_participant"]
    sid: int
    uid: int
    spid: int


def create_session_participant_token(
    *,
    session_id: int,
    user_id: int,
    session_participant_id: int,
    expires_seconds: int | None = None,
) -> str:
    exp_seconds = expires_seconds or int(settings.access_token_expire_seconds or 86400)

    return create_token(
        subject=str(session_participant_id),
        expires_delta=exp_seconds,
        typ="session_participant",
        sid=session_id,
        uid=user_id,
        spid=session_participant_id,
    )


def decode_session_participant_token(token: str) -> SessionParticipantTokenClaims:
    try:
        payload = decode_token(token)
    except Exception as e:
        raise AuthenticationError("Invalid session participant token") from e

    # Admin access tokens (and other JWTs) are not valid for WS participant auth.
    if payload.get("typ") != "session_participant":
        raise AuthenticationError("wrong_token_type")

    try:
        return SessionParticipantTokenClaims.model_validate(payload)
    except Exception as e:
        raise AuthenticationError("Invalid session participant token") from e
