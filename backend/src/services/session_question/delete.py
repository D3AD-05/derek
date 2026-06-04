from sqlalchemy import delete
from sqlalchemy.orm import Session
from typing import List, Optional

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.session import SessionQuestion
from src.services.session.common.preconditions import ensure_session_exists
from .common.schemas import DeleteSessionQuestionData


def delete_session_questions_service(
    *,
    session: Session,
    session_id: int,
    data: DeleteSessionQuestionData | None,
):

    ensure_session_exists(session=session, id=session_id)

    with transactional(session):
        stmt = delete(SessionQuestion).where(SessionQuestion.session_id == session_id)

        # optional question_ids
        if data and data.question_ids:
            stmt = stmt.where(SessionQuestion.question_id.in_(data.question_ids))

        result = session.execute(stmt)

    return result.rowcount
