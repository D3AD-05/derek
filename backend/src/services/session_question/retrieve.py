from sqlalchemy.orm import Session
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.session import SessionQuestion
from .common.preconditions import ensure_session_question_exists
from .common.params import SessionQuestionRetrieveParams, SessionQuestionExpand
from .common import statements


def retrieve_session_question_service(
    *,
    session: Session,
    session_question_id: int,
    params: SessionQuestionRetrieveParams,
) -> SessionQuestion:
    ensure_session_question_exists(session=session, id=session_question_id)

    stmt = statements.base_select_stmt.where(SessionQuestion.id == session_question_id)

    expand_handlers = [
        (SessionQuestionExpand.session, statements.session_expand_stmt),
        (SessionQuestionExpand.question, statements.question_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    return session.scalar(stmt)
