"""Added community_user table

Revision ID: 5241961222ca
Revises: 3d34dbfba8e7
Create Date: 2025-12-19 17:00:20.851716

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5241961222ca"
down_revision: Union[str, Sequence[str], None] = "3d34dbfba8e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "community_user",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("community_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["community_id"],
            ["community.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("user_id", "community_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("community_user")
