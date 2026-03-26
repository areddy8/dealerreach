from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class PageView(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "page_views"

    dealer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    product_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("products.id"), nullable=True
    )
    page_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # "storefront", "product_detail"
    visitor_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
