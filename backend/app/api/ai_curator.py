from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_session
from app.models.product import Product
from app.models.user import User
from app.services.ai_service import curate_products, generate_editorial_description

router = APIRouter(prefix="/ai", tags=["ai"])


class CurateRequest(BaseModel):
    query: str


class CurateResult(BaseModel):
    product_id: str
    reasoning: str


class CurateResponse(BaseModel):
    results: list[CurateResult]


class EditorialRequest(BaseModel):
    product_id: str


class EditorialResponse(BaseModel):
    product_id: str
    ai_description: str


@router.post("/curate", response_model=CurateResponse)
async def curate(
    body: CurateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    result = await session.execute(
        select(Product).where(Product.dealer_id == current_user.id)
    )
    products = result.scalars().all()

    products_data = [
        {
            "product_id": str(p.id),
            "brand": p.brand,
            "model_name": p.model_name,
            "category": str(p.category.value) if hasattr(p.category, "value") else str(p.category),
            "price": float(p.price) if p.price else None,
            "description": p.description,
            "specifications": p.specifications,
        }
        for p in products
    ]

    recommendations = await curate_products(body.query, products_data)
    return {"results": recommendations}


@router.post("/editorial", response_model=EditorialResponse)
async def editorial(
    body: EditorialRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    result = await session.execute(
        select(Product).where(
            Product.id == body.product_id, Product.dealer_id == current_user.id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    ai_text = await generate_editorial_description(
        product_name=product.model_name,
        brand=product.brand,
        category=str(product.category.value) if hasattr(product.category, "value") else str(product.category),
        specs=product.specifications,
    )
    if not ai_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service unavailable",
        )

    product.ai_description = ai_text
    await session.flush()
    return {"product_id": str(product.id), "ai_description": ai_text}
