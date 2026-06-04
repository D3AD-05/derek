from pydantic import EmailStr
from sqlalchemy.orm import Session
from src.core.config import settings
from src.core.exceptions import AuthenticationError
from src.core.utils import create_token, decode_token
from src.services.user.common.loaders import get_user_or_raise

from .common.preconditions import (
    ensure_password_updated_at_matches,
    ensure_user_is_active,
    ensure_user_password_is_correct,
)


def authenticate_service(
    *, session: Session, email: EmailStr, provided_password: str
) -> tuple[str, str]:
    # Loaders
    user = get_user_or_raise(session=session, email=email)

    # Preconditions
    ensure_user_password_is_correct(provided_password=provided_password, user=user)
    ensure_user_is_active(session=session, user=user)

    # Create refresh_token
    refresh_token = create_token(
        subject=user.email,
        expires_delta=settings.refresh_token_expire_seconds,
        password_updated_at=user.password_updated_at
        and user.password_updated_at.isoformat(),
    )

    # Create access_token
    access_token = create_token(
        subject=user.email,
        expires_delta=settings.access_token_expire_seconds,
        password_updated_at=user.password_updated_at
        and user.password_updated_at.isoformat(),
    )

    return access_token, refresh_token


def refresh_service(*, session: Session, refresh_token: str) -> str:
    payload = decode_token(refresh_token)
    email = payload.get("sub")
    if not email:
        raise AuthenticationError

    # Loaders
    user = get_user_or_raise(session=session, email=email)

    # Preconditions
    ensure_user_is_active(session=session, user=user)
    ensure_password_updated_at_matches(payload, user)
    # Create access_token
    access_token = create_token(
        subject=user.email,
        expires_delta=settings.access_token_expire_seconds,
        password_updated_at=user.password_updated_at
        and user.password_updated_at.isoformat(),
    )

    return access_token
