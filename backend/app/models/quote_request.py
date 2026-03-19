import enum
import uuid
from typing import Optional

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class QuoteRequestStatus(str, enum.Enum):
    pending = "pending"
    searching = "searching"
    enriching = "enriching"
    sending = "sending"
    monitoring = "monitoring"
    completed = "completed"


class QuoteRequest(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "quote_requests"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_name: Mapped[str] = mapped_column(String(500), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    zip_code: Mapped[str] = mapped_column(String(10), nullable=False)
    radius_miles: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    dealer_locator_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    reference_code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    status: Mapped[QuoteRequestStatus] = mapped_column(
        Enum(QuoteRequestStatus), default=QuoteRequestStatus.pending, nullable=False
    )

    user = relationship("User", back_populates="quote_requests")
    dealers = relationship("Dealer", back_populates="quote_request", lazy="selectin")
    outreach_records = relationship("OutreachRecord", back_populates="quote_request", lazy="selectin")
    replies = relationship("Reply", back_populates="quote_request", lazy="selectin")
    pipeline_jobs = relationship("PipelineJob", back_populates="quote_request", lazy="selectin")
