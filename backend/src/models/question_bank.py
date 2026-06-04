from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base
from src.models.user import User


class QuestionBank(Base):
    __tablename__ = "question_bank"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    community_id: Mapped[int] = mapped_column(
        ForeignKey("community.id"),
        nullable=False,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        nullable=False,
    )

    updated_by: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    # relationship
    created_by_user: Mapped["User"] = relationship(
        "User", foreign_keys=[created_by], backref="question_bank_created"
    )
    updated_by_user = relationship(
        "User", foreign_keys=[updated_by], backref="question_bank_updated"
    )

    community_id_QB = relationship(
        "Community", foreign_keys=[community_id], backref="QB_community"
    )

    def __repr__(self) -> str:
        return (
            f"QuestionBank(id={self.id}, "
            f"name='{self.name}', "
            f"community_id={self.community_id}, "
            f"created_by={self.created_by})"
        )
