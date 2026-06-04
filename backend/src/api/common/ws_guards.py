from __future__ import annotations

from datetime import datetime

from fastapi import WebSocket
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.utils import decode_token
from src.models.user import User


def _get_ws_token(websocket: WebSocket) -> str | None:
    token = websocket.query_params.get("token") or websocket.query_params.get(
        "access_token"
    )
    if token:
        return token

    auth = websocket.headers.get("authorization")
    if not auth:
        return None

    parts = auth.split(" ", 1)
    if len(parts) != 2:
        return None

    scheme, value = parts[0].lower(), parts[1].strip()
    if scheme != "bearer" or not value:
        return None

    return value


def authenticate_ws_user(*, session: Session, websocket: WebSocket) -> User | None:
    token = _get_ws_token(websocket)
    if not token:
        return None

    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            return None

        user = session.scalar(select(User).where(User.email == str(email).lower()))
        if user is None:
            return None

        password_updated_at_db = user.password_updated_at
        password_updated_at_pl = payload.get(
            "password_updated_at"
        ) and datetime.fromisoformat(payload["password_updated_at"])

        if password_updated_at_db != password_updated_at_pl:
            return None

        return user
    except JWTError:
        return None
    except Exception:
        session.rollback()
        return None
