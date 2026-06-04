from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, Boolean, Integer, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

from .user import User

from .question_bank import QuestionBank


class AnswerType(Base):
    __tablename__ = "answer_type"

    id: Mapped[int] = mapped_column(primary_key=True)

    display_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    def __repr__(self) -> str:
        return (
            f"AnswerType(id={self.id}, name='{self.display_name}', code='{self.code}')"
        )


class Question(Base):
    __tablename__ = "question"

    id: Mapped[int] = mapped_column(primary_key=True)

    question_bank_id: Mapped[int | None] = mapped_column(
        ForeignKey("question_bank.id"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    answer_type_id: Mapped[int] = mapped_column(
        ForeignKey("answer_type.id"),
        nullable=False,
    )

    is_scored: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    time_limit_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
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

    # ^ Relationships
    # -----------------------

    question_bank: Mapped["QuestionBank"] = relationship(
        "QuestionBank",
        foreign_keys=[question_bank_id],
        backref="questions",
    )

    answer_type: Mapped["AnswerType"] = relationship(
        "AnswerType",
        foreign_keys=[answer_type_id],
        backref="questions",
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        backref="questions_created",
    )

    updated_by_user = relationship(
        "User",
        foreign_keys=[updated_by],
        backref="questions_updated",
    )
    options: Mapped[list["Option"]] = relationship(
        "Option", back_populates="question", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"Question(id={self.id}, "
            f"question_bank_id={self.question_bank_id}, "
            f"title='{self.title}', "
            f"answer_type_id={self.answer_type_id}, "
            f"is_scored={self.is_scored})"
        )


class Option(Base):
    __tablename__ = "option"

    id: Mapped[int] = mapped_column(primary_key=True)

    question_id: Mapped[int] = mapped_column(
        ForeignKey("question.id"),
        nullable=False,
    )

    option_text: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
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

    # ^ Relationships
    # -----------------------

    question: Mapped["Question"] = relationship(
        "Question",
        foreign_keys=[question_id],
        back_populates="options",
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        backref="options_created",
    )

    updated_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[updated_by],
        backref="options_updated",
    )

    def __repr__(self) -> str:
        return (
            f"Option(id={self.id}, "
            f"question_id={self.question_id}, "
            f"option_text='{self.option_text}', "
            f"score={self.score})"
        )
