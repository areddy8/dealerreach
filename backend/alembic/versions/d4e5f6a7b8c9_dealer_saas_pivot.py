"""dealer saas pivot - add products, clients, projects, page_views tables and user fields

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-03-26 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Add new columns to users table ---
    op.add_column("users", sa.Column("company_name", sa.String(255), nullable=True))
    op.add_column(
        "users",
        sa.Column("company_slug", sa.String(255), nullable=True),
    )
    op.create_unique_constraint("uq_users_company_slug", "users", ["company_slug"])
    op.add_column("users", sa.Column("company_logo_url", sa.Text(), nullable=True))
    op.add_column(
        "users",
        sa.Column("role", sa.String(50), nullable=False, server_default="dealer_admin"),
    )
    op.add_column(
        "users",
        sa.Column(
            "subscription_tier",
            sa.String(50),
            nullable=False,
            server_default="free",
        ),
    )
    op.add_column(
        "users",
        sa.Column("onboarded", sa.Boolean(), nullable=False, server_default="false"),
    )

    # --- Create products table ---
    op.create_table(
        "products",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
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
        sa.Column("dealer_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("brand", sa.String(255), nullable=False),
        sa.Column("model_name", sa.String(255), nullable=False),
        sa.Column("model_number", sa.String(255), nullable=True),
        sa.Column(
            "category",
            sa.Enum(
                "ranges",
                "refrigerators",
                "dishwashers",
                "ventilation",
                "wine_storage",
                "outdoor",
                "fireplaces",
                "hot_tubs",
                "countertops",
                "other",
                name="productcategory",
            ),
            nullable=True,
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("ai_description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=True),
        sa.Column("msrp", sa.Numeric(12, 2), nullable=True),
        sa.Column("lead_time_days", sa.Integer(), nullable=True),
        sa.Column(
            "availability_status",
            sa.Enum(
                "in_stock",
                "low_stock",
                "special_order",
                "out_of_stock",
                "discontinued",
                name="availabilitystatus",
            ),
            nullable=True,
        ),
        sa.Column("hero_image_url", sa.Text(), nullable=True),
        sa.Column("gallery_image_urls", sa.JSON(), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("sku", sa.String(100), nullable=True),
        sa.Column("specifications", sa.JSON(), nullable=True),
    )

    # --- Create clients table ---
    op.create_table(
        "clients",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
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
        sa.Column("dealer_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    # --- Create client_projects table ---
    op.create_table(
        "client_projects",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
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
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False),
        sa.Column("dealer_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "draft",
                "active",
                "presented",
                "approved",
                "ordered",
                "completed",
                name="projectstatus",
            ),
            nullable=True,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("access_token", sa.String(64), nullable=False, unique=True),
    )

    # --- Create project_products table ---
    op.create_table(
        "project_products",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
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
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("client_projects.id"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("custom_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    # --- Create page_views table ---
    op.create_table(
        "page_views",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
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
        sa.Column("dealer_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "product_id",
            UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            nullable=True,
        ),
        sa.Column("page_type", sa.String(50), nullable=False),
        sa.Column("visitor_hash", sa.String(64), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("page_views")
    op.drop_table("project_products")
    op.drop_table("client_projects")
    op.drop_table("clients")
    op.drop_table("products")

    op.drop_constraint("uq_users_company_slug", "users", type_="unique")
    op.drop_column("users", "onboarded")
    op.drop_column("users", "subscription_tier")
    op.drop_column("users", "role")
    op.drop_column("users", "company_logo_url")
    op.drop_column("users", "company_slug")
    op.drop_column("users", "company_name")

    sa.Enum(name="productcategory").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="availabilitystatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="projectstatus").drop(op.get_bind(), checkfirst=True)
