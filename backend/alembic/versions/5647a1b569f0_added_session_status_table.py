"""Added session_status table

Revision ID: 5647a1b569f0
Revises: cd55f7d09e42
Create Date: 2026-01-18 19:57:26.893437

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5647a1b569f0"
down_revision: Union[str, Sequence[str], None] = "cd55f7d09e42"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "session_status",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "display_name",
            sa.String(length=50),
            nullable=False,
            comment="Upcoming, Ongoing, Completed",
        ),
        sa.Column(
            "code",
            sa.String(length=50),
            nullable=False,
            comment="upcoming, ongoing, completed",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.UniqueConstraint("display_name"),
    )

    # Insert initial values
    op.bulk_insert(
        sa.table(
            "session_status",
            sa.column("code", sa.String),
            sa.column("display_name", sa.String),
        ),
        [
            {"code": "upcoming", "display_name": "Upcoming"},
            {"code": "ongoing", "display_name": "Ongoing"},
            {"code": "completed", "display_name": "Completed"},
        ],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("session_status")
