from sqlalchemy.orm import Session
from src.models.user import User

from src.models.session import Session as SessionModel

from .common.preconditions import ensure_session_exists
from .common.params import SessionRetrieveParams, SessionExpand

from .common import statements


def retrieve_session_service(
    *,
    session: Session,
    session_id: int,
    params: SessionRetrieveParams,
):
    # require_platform_admin(current_user)
    ensure_session_exists(session=session, id=session_id)

    stmt = statements.base_select_stmt.where(SessionModel.id == session_id)

    # Expanding stmnt
    expand_handlers = [
        (SessionExpand.community, statements.community_expand_stmt),
        # (SessionExpand.session_status, statements.session_status_expand_stmt),
        (SessionExpand.session_question, statements.session_question_expand_stmt),
        (SessionExpand.created_by, statements.created_by_expand_stmt),
        (SessionExpand.updated_by, statements.updated_by_expand_stmt),
    ]

    for exp, handler in expand_handlers:
        if exp in params.expand:
            stmt = handler(stmt)

    return session.scalar(stmt)
