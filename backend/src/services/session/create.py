from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.session import Session, SessionQuestion
from src.services.session.common.schemas import SessionCreateData
from src.services.community.common.preconditions import (
    ensure_community_exists,
)

from src.services.session.common.loaders import get_session_status_or_raise
from src.services.question.common.preconditions import ensure_question_exists


def create_session_service(
    *, session: Session, data: SessionCreateData, current_user: User
):

    # ensure community exists
    ensure_community_exists(session=session, id=data.community_id)

    # ensure & get session status
    get_session_status_or_raise(session=session, id=data.session_status_id)

    question_ids = [q.question_id for q in data.questions]
    if len(question_ids) != len(set(question_ids)):
        raise ValueError("Duplicate question_id in request payload")

    positions = [q.position for q in data.questions]
    if len(positions) != len(set(positions)):
        raise ValueError("Duplicate position in request payload")

    with transactional(session):
        new_session = Session(
            name=data.name,
            venue=data.venue,
            community_id=data.community_id,
            session_status_id=data.session_status_id,
            created_by=current_user.id,
            updated_by=current_user.id,
        )

        session.add(new_session)
        session.flush()

        for item in data.questions:
            ensure_question_exists(session=session, id=item.question_id)

        for item in data.questions:
            session.add(
                SessionQuestion(
                    session_id=new_session.id,
                    question_id=item.question_id,
                    position=item.position,
                )
            )

        session.flush()

    return new_session
