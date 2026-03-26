import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.dealer import DealerResponse
from app.schemas.reply import ReplyResponse


class CreateQuoteRequest(BaseModel):
    product_name: str = Field(..., max_length=500)
    brand: Optional[str] = Field(None, max_length=255)
    specs: Optional[str] = None
    zip_code: str = Field(..., max_length=10)
    radius_miles: int = Field(50, ge=1, le=500)
    dealer_locator_url: Optional[str] = Field(None, max_length=2048)
    category: Optional[str] = None


class QuoteRequestResponse(BaseModel):
    id: uuid.UUID
    product_name: str
    brand: Optional[str]
    specs: Optional[str]
    zip_code: str
    radius_miles: int
    dealer_locator_url: Optional[str]
    category: Optional[str] = None
    reference_code: str
    status: str
    created_at: datetime
    updated_at: datetime
    dealer_count: int = 0
    reply_count: int = 0

    model_config = {"from_attributes": True}


class QuoteRequestDetail(BaseModel):
    id: uuid.UUID
    product_name: str
    brand: Optional[str]
    specs: Optional[str]
    zip_code: str
    radius_miles: int
    dealer_locator_url: Optional[str]
    category: Optional[str] = None
    reference_code: str
    status: str
    created_at: datetime
    updated_at: datetime
    dealers: List[DealerResponse] = []
    replies: List[ReplyResponse] = []

    model_config = {"from_attributes": True}
