import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):
    brand: str
    model_name: str
    model_number: Optional[str] = None
    category: str = "other"
    description: Optional[str] = None
    price: Optional[float] = None
    msrp: Optional[float] = None
    lead_time_days: Optional[int] = None
    availability_status: str = "in_stock"
    hero_image_url: Optional[str] = None
    gallery_image_urls: Optional[list[str]] = None
    featured: bool = False
    published: bool = True
    tags: Optional[list[str]] = None
    sku: Optional[str] = None
    specifications: Optional[dict[str, Any]] = None


class ProductUpdate(BaseModel):
    brand: Optional[str] = None
    model_name: Optional[str] = None
    model_number: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    msrp: Optional[float] = None
    lead_time_days: Optional[int] = None
    availability_status: Optional[str] = None
    hero_image_url: Optional[str] = None
    gallery_image_urls: Optional[list[str]] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None
    tags: Optional[list[str]] = None
    sku: Optional[str] = None
    specifications: Optional[dict[str, Any]] = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    dealer_id: str
    brand: str
    model_name: str
    model_number: Optional[str] = None
    category: str
    description: Optional[str] = None
    ai_description: Optional[str] = None
    price: Optional[float] = None
    msrp: Optional[float] = None
    lead_time_days: Optional[int] = None
    availability_status: str
    hero_image_url: Optional[str] = None
    gallery_image_urls: Optional[list[str]] = None
    featured: bool
    published: bool
    tags: Optional[list[str]] = None
    sku: Optional[str] = None
    specifications: Optional[dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
