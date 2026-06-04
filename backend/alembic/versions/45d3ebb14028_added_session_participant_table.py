"""Added session_participant table

Revision ID: 45d3ebb14028
Revises: 85b36a994ebb
Create Date: 2026-01-20 11:06:52.789546

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "45d3ebb14028"
down_revision: Union[str, Sequence[str], None] = "85b36a994ebb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "session_participant",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("total_score", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "total_time_taken_ms", sa.Integer(), server_default="0", nullable=False
        ),
        sa.ForeignKeyConstraint(["session_id"], ["session.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "session_id", "user_id", name="uq_session_participant_session_user"
        ),
    )
    op.create_index(
        op.f("ix_session_participant_session_id"),
        "session_participant",
        ["session_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_session_participant_user_id"),
        "session_participant",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_session_participant_user_id"), table_name="session_participant"
    )
    op.drop_index(
        op.f("ix_session_participant_session_id"), table_name="session_participant"
    )
    op.drop_table("session_participant")
