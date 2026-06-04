from sqlalchemy import delete
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.core.exceptions import AuthorizationError
from src.models.session import SessionQuestion
from src.models.user import User
from src.services.session.common.schemas import SessionUpdateData
from src.services.question.common.preconditions import ensure_question_exists
from .common.loaders import get_session_or_raise
from .common.loaders import get_session_status, get_session_status_or_raise


def update_session_service(
    *,
    session: Session,
    session_id: int,
    data: SessionUpdateData,
    current_user: User,
) -> object:

    # Loaders
    session_data = get_session_or_raise(session=session, id=session_id)

    with transactional(session):
        payload = data.model_dump(exclude_unset=True)
        questions = payload.pop("questions", None)

        for key, value in payload.items():
            setattr(session_data, key, value)
        session_data.updated_by = current_user.id

        if questions is not None:
            question_ids = [q["question_id"] for q in questions]
            if len(question_ids) != len(set(question_ids)):
                raise ValueError("Duplicate question_id in request payload")

            positions = [q["position"] for q in questions]
            if len(positions) != len(set(positions)):
                raise ValueError("Duplicate position in request payload")

            # replace existing mappings
            session.execute(
                delete(SessionQuestion).where(SessionQuestion.session_id == session_id)
            )

            for item in questions:
                ensure_question_exists(session=session, id=item["question_id"])
                session.add(
                    SessionQuestion(
                        session_id=session_id,
                        question_id=item["question_id"],
                        position=item["position"],
                    )
                )

            session.flush()

        return session_data


def update_session_status(
    *,
    session: Session,
    session_id: int,
    current_user: User,
    transition: str = "start",
) -> object:

    session_data = get_session_or_raise(session=session, id=session_id)
    upcoming_status = get_session_status_or_raise(session=session, code="upcoming")

    ongoing_status = get_session_status_or_raise(session=session, code="ongoing")
    completed_status = get_session_status_or_raise(session=session, code="completed")

    if transition == "start":
        if session_data.session_status_id == ongoing_status.id:
            return session_data
        if session_data.session_status_id == completed_status.id:
            raise AuthorizationError("Cannot start a completed session")

        startable_status_ids = {upcoming_status.id}
        if session_data.session_status_id not in startable_status_ids:
            raise AuthorizationError("Session is not upcoming to start")

        next_status_id = ongoing_status.id

    elif transition == "end":
        if session_data.session_status_id == completed_status.id:
            return session_data
        if session_data.session_status_id != ongoing_status.id:
            raise AuthorizationError("Session is not ongoing to end")

        next_status_id = completed_status.id

    else:
        raise ValueError("Invalid transition; expected 'start' or 'end'")

    with transactional(session):
        session_data.session_status_id = next_status_id
        session_data.updated_by = current_user.id
        session.add(session_data)
        return session_data
