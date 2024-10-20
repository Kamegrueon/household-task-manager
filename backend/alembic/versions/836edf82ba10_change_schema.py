"""change schema

Revision ID: 836edf82ba10
Revises: 51fc0a40ff2c
Create Date: 2024-10-18 23:44:01.442720

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "836edf82ba10"
down_revision: Union[str, None] = "51fc0a40ff2c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "task_executions",
        "execution_date",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.Date(),
        existing_nullable=False,
    )
    op.drop_index("ix_users_username", table_name="users")
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.alter_column(
        "task_executions",
        "execution_date",
        existing_type=sa.Date(),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
