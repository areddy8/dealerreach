from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class User(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_verified: Mapped[bool] = mapped_column(default=False, nullable=False, server_default="false")
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # B2B dealer SaaS fields
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    company_slug: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    company_logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="dealer_admin")
    subscription_tier: Mapped[str] = mapped_column(String(50), default="free")
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False)

    quote_requests = relationship("QuoteRequest", back_populates="user", lazy="selectin")
    products = relationship("Product", back_populates="dealer", lazy="selectin")
