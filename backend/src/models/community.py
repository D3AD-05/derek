from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    PrimaryKeyConstraint,
    String,
    func,
)
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.core.database import Base
from src.models.user import User


class Community(Base):
    __tablename__ = "community"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        nullable=False,
    )
    updated_by: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # relationship
    created_by_user: Mapped["User"] = relationship(
        "User", foreign_keys=[created_by], backref="communities_created"
    )
    updated_by_user = relationship(
        "User", foreign_keys=[updated_by], backref="communities_updated"
    )
    users: Mapped[list["User"]] = relationship(
        "User",
        secondary="community_user",
        backref="communities"
    )

    def __repr__(self):
        return f"Community(id={self.id}, name='{self.name}') "


class CommunityUser(Base):
    __tablename__ = "community_user"

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    community_id: Mapped[int] = mapped_column(
        ForeignKey("community.id"), nullable=False
    )

    __table_args__ = (PrimaryKeyConstraint("user_id", "community_id"),)

    def __repr__(self):
        return (
            f"CommunityUser(user_id={self.user_id}, "
            f"community_id='{self.community_id}') "
        )
