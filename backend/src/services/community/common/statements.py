from sqlalchemy import select
from sqlalchemy.orm import selectinload, contains_eager
from src.models.community import Community, CommunityUser
from src.models.user import User

base_select_stmt = select(Community)


def created_by_expand_stmt(stmt):
    return stmt.options(selectinload(Community.created_by_user))


def updated_by_expand_stmt(stmt):
    return stmt.options(selectinload(Community.updated_by_user))


def users_expand_stmt(stmt):
    return stmt.join(
        CommunityUser, 
        CommunityUser.community_id == Community.id, 
        isouter=True
    ).join(
        User,
        User.id == CommunityUser.user_id,
        isouter=True
    ).options(contains_eager(Community.users))
