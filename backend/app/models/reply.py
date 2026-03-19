import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKey


class Reply(Base, UUIDPrimaryKey):
    __tablename__ = "replies"

    outreach_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("outreach_records.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quote_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quote_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    dealer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dealers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    raw_body: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    parsed_lead_time: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parsed_availability: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parsed_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    outreach_record = relationship("OutreachRecord", back_populates="replies")
    quote_request = relationship("QuoteRequest", back_populates="replies")
    dealer = relationship("Dealer", back_populates="replies")
