"""Added session answer tables

Revision ID: acebbcc6c703
Revises: 45d3ebb14028
Create Date: 2026-02-19 15:06:59.836163

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "acebbcc6c703"
down_revision: Union[str, Sequence[str], None] = "45d3ebb14028"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "answer_status",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("display_name", sa.String(length=50), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    # Insert initial values
    op.bulk_insert(
        sa.table(
            "answer_status",
            sa.column("code", sa.String),
            sa.column("display_name", sa.String),
        ),
        [
            {"code": "answered", "display_name": "Answered"},
            {"code": "skipped", "display_name": "Skipped"},
            {"code": "timeout", "display_name": "Timeout"},
        ],
    )

    op.create_table(
        "session_participant_question",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_participant_id", sa.Integer(), nullable=False),
        sa.Column("session_question_id", sa.Integer(), nullable=False),
        sa.Column("answer_status_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), server_default="0", nullable=False),
        sa.Column("time_taken_ms", sa.Integer(), server_default="0", nullable=False),
        sa.Column("answer_text", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["answer_status_id"],
            ["answer_status.id"],
        ),
        sa.ForeignKeyConstraint(
            ["session_participant_id"], ["session_participant.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["session_question_id"], ["session_question.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint(
            "session_participant_id", 
            "session_question_id", 
            name="uq_session_participant_question"),
        sa.PrimaryKeyConstraint("id"),
        sa.Index(
            "ix_spq_session_participant_id", 
            "session_participant_id", 
            unique=False
        ),
        sa.Index(
            "ix_spq_session_question_id", 
            "session_question_id", 
            unique=False
        )
    )

    op.create_table(
        "session_participant_question_option",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_participant_question_id", sa.Integer(), nullable=False),
        sa.Column("option_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["option_id"], ["option.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["session_participant_question_id"],
            ["session_participant_question.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.Index(
            "ix_spqo_session_participant_question_id", 
            "session_participant_question_id", 
            unique=False
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("session_participant_question_option")
    op.drop_table("session_participant_question")
    op.drop_table("answer_status")
