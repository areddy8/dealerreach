from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.rate_limit import RateLimit
from app.database import get_session
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/s", tags=["storefront"])


class StorefrontInfo(BaseModel):
    company_name: str | None = None
    company_logo_url: str | None = None
    featured_products: list[ProductResponse] = []


class InquiryRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str
    product_id: str | None = None


class InquiryResponse(BaseModel):
    status: str = "received"
    message: str = "Your inquiry has been submitted successfully."


async def _get_dealer_by_slug(
    slug: str, session: AsyncSession
) -> User:
    result = await session.execute(
        select(User).where(User.company_slug == slug)
    )
    dealer = result.scalar_one_or_none()
    if not dealer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Storefront not found")
    return dealer


@router.get("/{slug}", response_model=StorefrontInfo)
async def get_storefront(
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    dealer = await _get_dealer_by_slug(slug, session)

    result = await session.execute(
        select(Product).where(
            Product.dealer_id == dealer.id,
            Product.published == True,  # noqa: E712
            Product.featured == True,  # noqa: E712
        )
    )
    featured_products = list(result.scalars().all())

    return {
        "company_name": dealer.company_name,
        "company_logo_url": dealer.company_logo_url,
        "featured_products": featured_products,
    }


@router.get("/{slug}/products", response_model=list[ProductResponse])
async def list_storefront_products(
    slug: str,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> list[Product]:
    dealer = await _get_dealer_by_slug(slug, session)

    stmt = (
        select(Product)
        .where(
            Product.dealer_id == dealer.id,
            Product.published == True,  # noqa: E712
        )
        .offset(offset)
        .limit(limit)
        .order_by(Product.created_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{slug}/products/{product_id}", response_model=ProductResponse)
async def get_storefront_product(
    slug: str,
    product_id: str,
    session: AsyncSession = Depends(get_session),
) -> Product:
    dealer = await _get_dealer_by_slug(slug, session)

    result = await session.execute(
        select(Product).where(
            Product.id == product_id,
            Product.dealer_id == dealer.id,
            Product.published == True,  # noqa: E712
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post(
    "/{slug}/inquire",
    response_model=InquiryResponse,
    dependencies=[Depends(RateLimit(max_requests=5, window_seconds=60))],
)
async def submit_inquiry(
    slug: str,
    body: InquiryRequest,
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    # Verify dealer exists
    await _get_dealer_by_slug(slug, session)

    # In a full implementation, this would store the inquiry and send notifications.
    # For now, we acknowledge receipt.
    return {
        "status": "received",
        "message": "Your inquiry has been submitted successfully.",
    }
