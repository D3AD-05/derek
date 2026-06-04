from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Boolean,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base
from .community import Community
from .question import Question


# =========================
# ^ Session Status
# =========================


class SessionStatus(Base):
    __tablename__ = "session_status"

    id: Mapped[int] = mapped_column(primary_key=True)

    display_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        comment="Upcoming, Ongoing, Completed",
    )

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        comment="upcoming, ongoing, completed",
    )

    # Relationships
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        back_populates="session_status",
    )

    def __repr__(self) -> str:
        return f"SessionStatus(id={self.id}, name='{self.name}', code='{self.code}')"


# =========================
# ^ Session
# =========================


class Session(Base):
    __tablename__ = "session"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    venue: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    community_id: Mapped[int] = mapped_column(
        ForeignKey("community.id"),
        nullable=False,
    )

    session_status_id: Mapped[int] = mapped_column(
        ForeignKey("session_status.id"),
        nullable=False,
    )

    last_triggered_question_id: Mapped[int | None] = mapped_column(
        ForeignKey("question.id"),
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

    # Relationships
    community: Mapped["Community"] = relationship(
        "Community",
        foreign_keys=[community_id],
        backref="sessions",
    )

    session_status: Mapped["SessionStatus"] = relationship(
        "SessionStatus",
        foreign_keys=[session_status_id],
        back_populates="sessions",
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        backref="sessions_created",
    )

    updated_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[updated_by],
        backref="sessions_updated",
    )

    session_questions: Mapped[list["SessionQuestion"]] = relationship(
        "SessionQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="SessionQuestion.position",
    )

    participants: Mapped[list["SessionParticipant"]] = relationship(
        "SessionParticipant",
        back_populates="session",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"Session(id={self.id}, "
            f"name='{self.name}', "
            f"community_id={self.community_id}, "
            f"session_status_id={self.session_status_id})"
        )


# =========================
# ^ Session Question
# =========================


class SessionQuestion(Base):
    __tablename__ = "session_question"

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "question_id",
            name="uq_session_question",
        ),
        UniqueConstraint(
            "session_id",
            "position",
            name="uq_session_position",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    session_id: Mapped[int] = mapped_column(
        ForeignKey("session.id"),
        nullable=False,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("question.id"),
        nullable=False,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    is_triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)

    # Relationships
    session: Mapped["Session"] = relationship(
        "Session",
        foreign_keys=[session_id],
        back_populates="session_questions",
    )

    question: Mapped["Question"] = relationship(
        "Question",
        foreign_keys=[question_id],
        backref="session_questions",
    )

    participant_answers = relationship(
        "SessionParticipantQuestion",
        back_populates="session_question",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"SessionQuestion(id={self.id}, "
            f"session_id={self.session_id}, "
            f"question_id={self.question_id}, "
            f"position={self.position})"
        )


class SessionParticipant(Base):
    __tablename__ = "session_participant"

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "user_id",
            name="uq_session_participant_session_user",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey("session.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    total_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    total_time_taken_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    #  Relationships
    # --------------
    session: Mapped["Session"] = relationship(
        "Session",
        back_populates="participants",
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="session_participations",
    )

    question_answers = relationship(
        "SessionParticipantQuestion",
        back_populates="participant",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"SessionQuestion(id={self.id}, "
            f"session_id={self.session_id}, "
            f"question_id={self.user_id}, "
            f"position={self.total_time_taken_ms})"
            f"position={self.total_score})"
        )


# =========================
# ^ Session Answers
# =========================


# * Answer Status
class AnswerStatus(Base):
    __tablename__ = "answer_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    display_name: Mapped[str] = mapped_column(String(50), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Relationships
    participant_answers: Mapped[list["SessionParticipantQuestion"]] = relationship(
        "SessionParticipantQuestion",
        back_populates="answer_status",
    )

    def __repr__(self) -> str:
        return f"AnswerStatus(id={self.id}, code={self.code})"


# ! Session participiant Question
class SessionParticipantQuestion(Base):
    __tablename__ = "session_participant_question"

    __table_args__ = (
        UniqueConstraint(
            "session_participant_id",
            "session_question_id",
            name="uq_session_participant_question",
        ),
        Index("ix_spq_session_participant_id", "session_participant_id"),
        Index("ix_spq_session_question_id", "session_question_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    session_participant_id: Mapped[int] = mapped_column(
        ForeignKey("session_participant.id", ondelete="CASCADE"), nullable=False
    )

    session_question_id: Mapped[int] = mapped_column(
        ForeignKey("session_question.id", ondelete="CASCADE"), nullable=False
    )

    answer_status_id: Mapped[int] = mapped_column(
        ForeignKey("answer_status.id"),
        nullable=False,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    time_taken_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    answer_text: Mapped[str | None] = mapped_column(String, nullable=True)

    # Relationships
    participant: Mapped["SessionParticipant"] = relationship(
        "SessionParticipant",
        back_populates="question_answers",
    )

    session_question: Mapped["SessionQuestion"] = relationship(
        "SessionQuestion",
        back_populates="participant_answers",
    )

    answer_status: Mapped["AnswerStatus"] = relationship(
        "AnswerStatus",
        back_populates="participant_answers",
    )

    selected_options: Mapped[list["SessionParticipantQuestionOption"]] = relationship(
        "SessionParticipantQuestionOption",
        back_populates="participant_question",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"SPQ(id={self.id}, participant_id={self.session_participant_id}, "
            f"question_id={self.session_question_id}, score={self.score})"
        )


class SessionParticipantQuestionOption(Base):
    __tablename__ = "session_participant_question_option"

    __table_args__ = (
        Index(
            "ix_spqo_session_participant_question_id", "session_participant_question_id"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    session_participant_question_id: Mapped[int] = mapped_column(
        ForeignKey("session_participant_question.id", ondelete="CASCADE"),
        nullable=False,
    )

    option_id: Mapped[int | None] = mapped_column(
        ForeignKey("option.id", ondelete="CASCADE"),
        nullable=True,
    )

    # Relationships
    participant_question: Mapped["SessionParticipantQuestion"] = relationship(
        "SessionParticipantQuestion",
        back_populates="selected_options",
    )

    option: Mapped["Option"] = relationship("Option")

    def __repr__(self) -> str:
        return f"SPQOption(id={self.id}, option_id={self.option_id})"
