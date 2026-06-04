from src.core.exceptions import AuthorizationError
from src.models.user import User


def require_platform_admin(current_user: User):
    if not current_user.is_platform_admin:
        raise AuthorizationError("Platform admin access required.")
