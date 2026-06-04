from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models.session import SessionParticipant


base_select_stmt = select(SessionParticipant)


def session_expand_stmt(stmt):
    return stmt.options(selectinload(SessionParticipant.session))


def session_user_expand_stmt(stmt):
    return stmt.options(selectinload(SessionParticipant.user))
