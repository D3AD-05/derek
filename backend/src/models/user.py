from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.session import SessionParticipant


# from src.models.session import SessionParticipant


class UserStatus(Base):
    __tablename__ = "user_status"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(50), nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="user_status")

    def __repr__(self) -> str:
        return (
            f"UserStatus(id={self.id}, "
            f"code='{self.code}', "
            f"display_name='{self.display_name}')"
        )


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_platform_admin: Mapped[bool] = mapped_column(
        default=False, server_default=false(), nullable=False
    )
    user_status_id: Mapped[int] = mapped_column(
        ForeignKey("user_status.id"), nullable=False
    )
    password_updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_by: Mapped[int | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        nullable=False,
    )
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ✅ relationship
    user_status: Mapped["UserStatus"] = relationship(
        "UserStatus",
        back_populates="users",
    )

    # ✅ self-referential relationships
    created_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[created_by],
        remote_side=[id],
        backref="created_users",
    )

    updated_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[updated_by],
        remote_side=[id],
        backref="updated_users",
    )

    session_participations: Mapped[list["SessionParticipant"]] = relationship(
        "SessionParticipant",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"User(id={self.id}, "
            f"name='{self.name}', "
            f"email='{self.email}', "
            f"is_platform_admin={self.is_platform_admin}, "
            f"user_status_id={self.user_status_id})"
        )
