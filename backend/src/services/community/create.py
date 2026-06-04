from sqlalchemy import select
from sqlalchemy.orm import Session
from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.community import Community
from src.models.user import User, UserStatus
from src.models.community import CommunityUser


def create_community_service(
    *, session: Session, data: dict, current_user: User
) -> Community:
    require_platform_admin(current_user)

    users_data = data.get("users")
    with transactional(session):
        # 1. Create community
        new_community = Community(
            name=data["name"],
            created_by=current_user.id,
            updated_by=current_user.id,
        )
        session.add(new_community)
        session.flush()

        # 2. Users are OPTIONAL
        if users_data:
            inactive_user_status_id = session.scalar(
                select(UserStatus.id).where(UserStatus.code == "inactive")
            )
            for user_data in users_data:
                user = session.scalar(
                    select(User).where(User.email == user_data["email"])
                )
                if not user:
                    user = User(
                        name=user_data["name"],
                        email=user_data["email"],
                        is_platform_admin=False,
                        user_status_id=inactive_user_status_id,
                    )
                    session.add(user)
                    session.flush()
                session.add(
                    CommunityUser(
                        community_id=new_community.id,
                        user_id=user.id,
                    )
                )
        return new_community
