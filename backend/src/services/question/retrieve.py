from sqlalchemy.orm import Session
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.question import Question

from .common.preconditions import ensure_question_exists
from .common.params import QuestionRetrieveParams, QuestionExpand

from .common import statements


def retrieve_question_service(
    *,
    session: Session,
    question_id: int,
    params: QuestionRetrieveParams,
    current_user: User
) -> Question:
    ensure_question_exists(session=session, id=question_id)

    stmt = statements.base_select_stmt.where(Question.id == question_id)

    expand_handlers = [
        (QuestionExpand.answer_type, statements.answer_type_expand_stmt),
        (QuestionExpand.question_bank, statements.question_bank_expand_stmt),
        (QuestionExpand.created_by, statements.created_by_expand_stmt),
        (QuestionExpand.updated_by, statements.updated_by_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    return session.scalar(stmt)
