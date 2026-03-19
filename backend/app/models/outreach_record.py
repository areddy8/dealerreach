import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKey


class OutreachMethod(str, enum.Enum):
    email = "email"
    contact_form = "contact_form"


class OutreachStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"
    replied = "replied"


class OutreachRecord(Base, UUIDPrimaryKey):
    __tablename__ = "outreach_records"

    dealer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dealers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quote_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quote_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    method: Mapped[OutreachMethod] = mapped_column(Enum(OutreachMethod), nullable=False)
    status: Mapped[OutreachStatus] = mapped_column(
        Enum(OutreachStatus), default=OutreachStatus.pending, nullable=False
    )
    email_subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    email_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    dealer = relationship("Dealer", back_populates="outreach_records")
    quote_request = relationship("QuoteRequest", back_populates="outreach_records")
    replies = relationship("Reply", back_populates="outreach_record", lazy="selectin")
