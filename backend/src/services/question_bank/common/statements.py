from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models.question_bank import QuestionBank
from src.models.community import Community

base_select_stmt = select(QuestionBank)


def created_by_expand_stmt(stmt):
    return stmt.options(selectinload(QuestionBank.created_by_user))


def updated_by_expand_stmt(stmt):
    return stmt.options(selectinload(QuestionBank.updated_by_user))


def community_id_expand_stmt(stmt):
    return stmt.options(selectinload(QuestionBank.community_id_QB))
