from __future__ import annotations

import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class ProductCategory(str, enum.Enum):
    ranges = "ranges"
    refrigerators = "refrigerators"
    dishwashers = "dishwashers"
    ventilation = "ventilation"
    wine_storage = "wine_storage"
    outdoor = "outdoor"
    fireplaces = "fireplaces"
    hot_tubs = "hot_tubs"
    countertops = "countertops"
    other = "other"


class AvailabilityStatus(str, enum.Enum):
    in_stock = "in_stock"
    low_stock = "low_stock"
    special_order = "special_order"
    out_of_stock = "out_of_stock"
    discontinued = "discontinued"


class Product(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "products"

    dealer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    brand: Mapped[str] = mapped_column(String(255), nullable=False)
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[ProductCategory] = mapped_column(
        Enum(ProductCategory), default=ProductCategory.other
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    msrp: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    lead_time_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    availability_status: Mapped[AvailabilityStatus] = mapped_column(
        Enum(AvailabilityStatus), default=AvailabilityStatus.in_stock
    )
    hero_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    gallery_image_urls: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    tags: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    specifications: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    dealer = relationship("User", back_populates="products")
