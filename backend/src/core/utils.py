from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

from jose import jwt
from src.core.config import settings


def create_token(
    subject: Union[str, Any], expires_delta: Optional[int] = 3600, **kwargs
) -> str:
    exp = datetime.now(timezone.utc) + timedelta(seconds=expires_delta)
    payload = {"exp": exp, "sub": str(subject)}
    payload.update(kwargs)  # Add extra fields to the payload

    encoded_jwt = jwt.encode(payload, settings.secret_key, settings.algorithm)

    return encoded_jwt


def decode_token(token: str) -> dict:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

    return payload
