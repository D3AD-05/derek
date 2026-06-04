from sqlalchemy import select
from sqlalchemy.orm import aliased, selectinload
from src.models.user import User

# Create alias of User
CreatedByUser = aliased(User, name="CreatedByUser")
UpdatedByUser = aliased(User, name="UpdatedByUser")


base_select_stmt = select(User)


def user_status_expand_stmt(stmt):
    return stmt.options(selectinload(User.user_status))


def created_by_expand_stmt(stmt):
    return stmt.options(selectinload(User.created_by_user))


def updated_by_expand_stmt(stmt):
    return stmt.options(selectinload(User.updated_by_user))
