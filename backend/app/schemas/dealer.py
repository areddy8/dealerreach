import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DealerResponse(BaseModel):
    id: uuid.UUID
    quote_request_id: uuid.UUID
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}
