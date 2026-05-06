"""add_users_and_user_org_memberships

Revision ID: a1b2c3d4e5f6
Revises: 9f2a1d7c8b31
Create Date: 2026-04-26 11:14:03.597764

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9f2a1d7c8b31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("supabase_user_id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_supabase_user_id", "users", ["supabase_user_id"], unique=True)

    op.create_table(
        "user_org_memberships",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("org_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["org_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", "org_id", name="uq_user_org"),
    )
    op.create_index("ix_user_org_memberships_user_id", "user_org_memberships", ["user_id"])
    op.create_index("ix_user_org_memberships_org_id", "user_org_memberships", ["org_id"])


def downgrade() -> None:
    op.drop_table("user_org_memberships")
    op.drop_index("ix_users_supabase_user_id", "users")
    op.drop_table("users")
