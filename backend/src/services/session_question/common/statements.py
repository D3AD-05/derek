from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models.session import SessionQuestion

base_select_stmt = select(SessionQuestion)


def session_expand_stmt(stmt):
    return stmt.options(selectinload(SessionQuestion.session))


def question_expand_stmt(stmt):
    return stmt.options(selectinload(SessionQuestion.question))
