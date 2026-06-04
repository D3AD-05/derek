from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.core.exceptions import NotFoundError
from src.models.user import User
from src.models.session import SessionParticipant
from .common.loaders import get_participant_or_raise


def delete_session_participant_service(
    *, session: Session, participant_id: int, current_user: User
) -> None:
    require_platform_admin(current_user)

    participant = get_participant_or_raise(
        session=session,
        id=participant_id,
    )

    session.delete(participant)
    session.commit()
