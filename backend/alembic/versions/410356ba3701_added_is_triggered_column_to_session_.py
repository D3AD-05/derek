"""Added is_triggered column to session_question table

Revision ID: 410356ba3701
Revises: acebbcc6c703
Create Date: 2026-03-13 13:55:31.450945

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '410356ba3701'
down_revision: Union[str, Sequence[str], None] = 'acebbcc6c703'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('session_question', sa.Column('is_triggered', sa.Boolean(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('session_question', 'is_triggered')
