from sqlalchemy import delete
from sqlalchemy.orm import Session
from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User

from .common.preconditions import ensure_user_exists


def delete_user_service(*, session: Session, user_id: int, current_user: User) -> None:
    # Auth check
    require_platform_admin(current_user)

    # Preconditions
    ensure_user_exists(session=session, id=user_id)

    # Delete user
    with transactional(session):
        session.execute(delete(User).where(User.id == user_id))
