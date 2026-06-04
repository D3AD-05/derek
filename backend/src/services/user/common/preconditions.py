from pydantic import EmailStr
from sqlalchemy.orm import Session
from src.core.exceptions import AlreadyExistsError
from src.services.user.common.params import UserListParams

from .loaders import get_user, get_user_or_raise, get_user_status_or_raise
from .schemas import UserCreateData, UserUpdateData


def ensure_user_exists(*, session: Session, id: int) -> None:
    get_user_or_raise(session=session, id=id)


def ensure_user_does_not_exist(*, session: Session, email: EmailStr) -> None:
    user = get_user(session=session, email=email)

    if user:
        raise AlreadyExistsError(f"User with email {email} already exists.")


def ensure_user_status_exists(*, session: Session, id: int) -> None:
    get_user_status_or_raise(session=session, id=id)


def ensure_create_data_is_valid(*, session: Session, data: UserCreateData) -> None:
    ensure_user_does_not_exist(session=session, email=data.email)


def ensure_update_data_is_valid(*, session: Session, data: UserUpdateData) -> None:
    if data.user_status_id:
        ensure_user_status_exists(session=session, id=data.user_status_id)
    


def ensure_list_params_are_valid(*, session: Session, params: UserListParams) -> None:
    if params.filter.user_status_id:
        ensure_user_status_exists(session=session, id=params.filter.user_status_id)

    if params.filter.created_by:
        ensure_user_exists(session=session, id=params.filter.created_by)

    if params.filter.updated_by:
        ensure_user_exists(session=session, id=params.filter.updated_by)
