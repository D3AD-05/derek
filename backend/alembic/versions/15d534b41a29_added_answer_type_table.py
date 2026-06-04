"""Added answer_type table

Revision ID: 15d534b41a29
Revises: b3e444ca5f77
Create Date: 2026-01-14 16:34:33.790657

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "15d534b41a29"
down_revision: Union[str, Sequence[str], None] = "b3e444ca5f77"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "answer_type",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("display_name", sa.String(length=50), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.UniqueConstraint("display_name"),
    )

    # Insert initial values
    op.bulk_insert(
        sa.table(
            "answer_type",
            sa.column("code", sa.String),
            sa.column("display_name", sa.String),
        ),
        [
            {"code": "radio", "display_name": "Radio"},
            {"code": "checkbox", "display_name": "Checkbox"},
            {"code": "textbox", "display_name": "Textbox"},
        ],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("answer_type")
