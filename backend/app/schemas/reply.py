import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ReplyResponse(BaseModel):
    id: uuid.UUID
    outreach_record_id: uuid.UUID
    quote_request_id: uuid.UUID
    dealer_id: uuid.UUID
    raw_body: str
    parsed_price: Optional[float]
    parsed_lead_time: Optional[str]
    parsed_availability: Optional[str]
    parsed_summary: Optional[str]
    received_at: datetime
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
