from sqlalchemy import delete
from sqlalchemy.orm import Session
from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.community import Community

from .common.preconditions import ensure_community_exists


def delete_community_service(
    *, session: Session, community_id: int, current_user: User
) -> None:

    require_platform_admin(current_user)

    ensure_community_exists(session=session, id=community_id)
    with transactional(session):
        session.execute(delete(Community).where(Community.id == community_id))
