from typing import Optional

from fastapi import Depends, HTTPException, Path, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.core.database import get_session
from src.models.user import User, UserStatus


# User validator for Query parameters
def create_user_query_validator(param_name: str):
    async def validator(
        value: Optional[int] = Query(None, alias=param_name),
        session: Session = Depends(get_session),
    ):
        if value:
            user = session.scalar(select(User).where(User.id == value))
            if not user:
                raise HTTPException(
                    status_code=404, detail=f"User with {param_name} {value} not found."
                )
        return value

    # Set the parameter name for FastAPI to recognize
    validator.__name__ = f"validate_{param_name}"
    return validator


validate_created_by = create_user_query_validator("created_by")
validate_updated_by = create_user_query_validator("updated_by")


# User validator for Path parameters
def create_user_path_validator(param_name: str):
    async def validator(
        value: int = Path(..., alias=param_name),
        session: Session = Depends(get_session),
    ):
        user = session.scalar(select(User).where(User.id == value))
        if not user:
            raise HTTPException(
                status_code=404, detail=f"User with {param_name} {value} not found."
            )

        return value

    # Set the parameter name for FastAPI to recognize
    validator.__name__ = f"validate_{param_name}"
    return validator


validate_user_id = create_user_path_validator("user_id")


# Query validator for user_id (used by list endpoints expecting user_id as a query param)
validate_user_id_query = create_user_query_validator("user_id")


async def validate_user_status_id(
    user_status_id: Optional[int] = None, session: Session = Depends(get_session)
):
    message_404 = f"User status ID {user_status_id} not found."

    if user_status_id:
        user_status = session.scalar(
            select(UserStatus).where(UserStatus.id == user_status_id)
        )
        if not user_status:
            raise HTTPException(status_code=404, detail=message_404)

    return user_status_id
