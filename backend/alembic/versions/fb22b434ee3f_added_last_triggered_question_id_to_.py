"""Added last_triggered_question_id to session table

Revision ID: fb22b434ee3f
Revises: 410356ba3701
Create Date: 2026-03-24 15:11:00.134513

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb22b434ee3f'
down_revision: Union[str, Sequence[str], None] = '410356ba3701'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'session', 
        sa.Column('last_triggered_question_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        None, 
        'session', 'question', ['last_triggered_question_id'], ['id']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'session', type_='foreignkey')
    op.drop_column('session', 'last_triggered_question_id')
