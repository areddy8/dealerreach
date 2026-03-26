from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class ProjectProduct(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "project_products"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("client_projects.id"), nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    custom_price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    project = relationship("ClientProject", back_populates="items")
    product = relationship("Product")
