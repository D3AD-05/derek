"""Added session_question table

Revision ID: 85b36a994ebb
Revises: f3bf81d92f9c
Create Date: 2026-01-18 20:13:11.894545

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "85b36a994ebb"
down_revision: Union[str, Sequence[str], None] = "f3bf81d92f9c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "session_question",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["question_id"],
            ["question.id"],
        ),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["session.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "position", name="uq_session_position"),
        sa.UniqueConstraint("session_id", "question_id", name="uq_session_question"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("session_question")
