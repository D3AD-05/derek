from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from src.core.database import transactional
from src.core.exceptions import NotFoundError 
from src.core.permissions import require_platform_admin
from src.models.community import CommunityUser
from src.models.user import User
from src.services.community.common.preconditions import ensure_community_exists

from .common.loaders import get_user_or_raise
from .common.preconditions import ensure_update_data_is_valid
from .common.schemas import UserUpdateData


def update_user_service(
    *,
    session: Session,
    user_id: int,
    data: UserUpdateData,
    current_user: User,
) -> User:
    # Auth check
    require_platform_admin(current_user)

    # Loaders
    user = get_user_or_raise(session=session, id=user_id)

    # Preconditions
    ensure_update_data_is_valid(session=session, data=data)

    payload = data.model_dump(exclude_unset=True)

    with transactional(session):
      
        for key, value in payload.items():
            if key != "community_ids":
                setattr(user, key, value)
        user.updated_by = current_user.id

        # community ids check is not in precondition for now 
        if "community_ids" in payload:
            incoming_ids_raw = payload.get("community_ids") or []

            valid_incoming_ids: set[int] = set()
            invalid_ids = []
            for community_id in incoming_ids_raw:
                try:
                    ensure_community_exists(session=session, id=community_id)
                    valid_incoming_ids.add(community_id)
                except NotFoundError:
                    # continue
                    invalid_ids.append(community_id)
                
            if invalid_ids:
                raise NotFoundError(
                f"Invalid community ids: {invalid_ids}"
    )

            existing_ids = set(
                session.scalars(
                    select(CommunityUser.community_id).where(
                        CommunityUser.user_id == user.id
                    )
                ).all()
            )

            to_add = valid_incoming_ids - existing_ids
            to_remove = existing_ids - valid_incoming_ids

            for community_id in to_add:
                session.add(
                    CommunityUser(user_id=user.id, community_id=community_id)
                )

            if to_remove:
                session.execute(
                    delete(CommunityUser).where(
                        CommunityUser.user_id == user.id,
                        CommunityUser.community_id.in_(to_remove),
                    )
                )

        return user
