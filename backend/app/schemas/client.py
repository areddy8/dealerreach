import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class ClientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(BaseModel):
    id: uuid.UUID
    dealer_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClientProjectCreate(BaseModel):
    client_id: uuid.UUID
    name: str
    notes: Optional[str] = None


class ClientProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ClientProjectResponse(BaseModel):
    id: uuid.UUID
    client_id: str
    dealer_id: str
    name: str
    status: str
    notes: Optional[str] = None
    access_token: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectProductCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = 1
    custom_price: Optional[float] = None
    notes: Optional[str] = None


class ProjectProductResponse(BaseModel):
    id: uuid.UUID
    project_id: str
    product_id: str
    quantity: int
    custom_price: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
