from sqlalchemy.orm import Session
from .schemas import SessionParticipantCreate
from .params import SessionParticipantsFilterParams
from src.services.session.common.preconditions import ensure_session_exists
from src.services.user.common.preconditions import ensure_user_exists


def ensure_create_data_is_valid(
    *, session: Session, data: SessionParticipantCreate
) -> None:
    if data.session_id:
        ensure_session_exists(session=session, id=data.session_id)
    if data.user_id:
        ensure_user_exists(session=session, id=data.user_id)


def ensure_filter_params_valid(
    *, session: Session, data: SessionParticipantsFilterParams
) -> None:
    if data.session_id:
        ensure_session_exists(session=session, id=data.session_id)
    if data.user_id:
        ensure_user_exists(session=session, id=data.user_id)
