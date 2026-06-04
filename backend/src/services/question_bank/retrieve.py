from asyncio import ensure_future
from sqlalchemy.orm import Session
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.question_bank import QuestionBank
from .common.params import QuestionBankRetrieveParams, QuestionBankExpand
from .common.statements import (
    base_select_stmt,
    created_by_expand_stmt,
    updated_by_expand_stmt,
    community_id_expand_stmt,
)
from .common.preconditions import ensure_question_bank_exists


def retrieve_question_bank_service(
    *,
    session: Session,
    question_bank_id: int,
    params: QuestionBankRetrieveParams,
    current_user: User
) -> QuestionBank:
    ensure_question_bank_exists(session=session, id=question_bank_id)

    stmt = base_select_stmt.where(QuestionBank.id == question_bank_id)

    expand_handlers = [
        (QuestionBankExpand.community, community_id_expand_stmt),
        (QuestionBankExpand.created_by, created_by_expand_stmt),
        (QuestionBankExpand.updated_by, updated_by_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    return session.scalar(stmt)
