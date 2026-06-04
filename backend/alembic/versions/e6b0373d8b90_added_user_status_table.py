"""Added user_status table

Revision ID: e6b0373d8b90
Revises:
Create Date: 2025-12-19 16:23:25.054782

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e6b0373d8b90"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "user_status",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    # Insert initial values
    op.bulk_insert(
        sa.table(
            "user_status",
            sa.column("code", sa.String),
            sa.column("display_name", sa.String),
        ),
        [
            {"code": "inactive", "display_name": "Inactive"},
            {"code": "active", "display_name": "Active"},
            {"code": "deactivated", "display_name": "Deactivated"},
        ],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("user_status")
