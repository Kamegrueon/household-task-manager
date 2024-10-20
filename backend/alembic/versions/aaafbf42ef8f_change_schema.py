"""change schema

Revision ID: aaafbf42ef8f
Revises: 836edf82ba10
Create Date: 2024-10-19 09:32:15.966149

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aaafbf42ef8f"
down_revision: Union[str, None] = "836edf82ba10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "task_executions",
        "execution_date",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "task_executions",
        "execution_date",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
