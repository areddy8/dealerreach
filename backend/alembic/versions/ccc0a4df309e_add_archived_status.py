"""add archived status

Revision ID: ccc0a4df309e
Revises: 3cde1e76c19c
Create Date: 2026-03-22 14:16:39.148537

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'ccc0a4df309e'
down_revision: Union[str, None] = '3cde1e76c19c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE quoterequeststatus ADD VALUE IF NOT EXISTS 'archived'")


def downgrade() -> None:
    # PostgreSQL does not support removing values from an enum type directly.
    # A full migration would require creating a new type, migrating data, and swapping.
    # For simplicity, we leave this as a no-op since 'archived' is additive.
    pass
