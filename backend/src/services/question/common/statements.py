from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models.question import Question

base_select_stmt = select(Question)


def answer_type_expand_stmt(stmt):
    return stmt.options(selectinload(Question.answer_type))


def question_bank_expand_stmt(stmt):
    return stmt.options(selectinload(Question.question_bank))


def created_by_expand_stmt(stmt):
    return stmt.options(selectinload(Question.created_by_user))


def updated_by_expand_stmt(stmt):
    return stmt.options(selectinload(Question.updated_by_user))


def options_expand_stmt(stmt):
    return stmt.options(selectinload(Question.options))
