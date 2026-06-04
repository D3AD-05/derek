from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.models.session import Session as SessionModel
from src.models.session import SessionQuestion

base_select_stmt = select(SessionModel)


def community_expand_stmt(stmt):
    return stmt.options(selectinload(SessionModel.community))


def session_status_expand_stmt(stmt):
    return stmt.options(selectinload(SessionModel.session_status))


def session_question_expand_stmt(stmt):
    return stmt.options(
        selectinload(SessionModel.session_questions).selectinload(
            SessionQuestion.question
        )
    )


def created_by_expand_stmt(stmt):
    return stmt.options(selectinload(SessionModel.created_by_user))


def updated_by_expand_stmt(stmt):
    return stmt.options(selectinload(SessionModel.updated_by_user))
