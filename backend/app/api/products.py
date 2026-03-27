from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_session
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.ai_service import generate_editorial_description

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductResponse])
async def list_products(
    category: str | None = None,
    brand: str | None = None,
    availability_status: str | None = None,
    search: str | None = None,
    featured: bool | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[Product]:
    stmt = select(Product).where(Product.dealer_id == current_user.id)

    if category:
        stmt = stmt.where(Product.category == category)
    if brand:
        stmt = stmt.where(Product.brand == brand)
    if availability_status:
        stmt = stmt.where(Product.availability_status == availability_status)
    if featured is not None:
        stmt = stmt.where(Product.featured == featured)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Product.model_name.ilike(pattern) | Product.brand.ilike(pattern)
        )

    stmt = stmt.offset(offset).limit(limit).order_by(Product.created_at.desc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Product:
    result = await session.execute(
        select(Product).where(
            Product.id == product_id, Product.dealer_id == current_user.id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Product:
    product = Product(
        dealer_id=current_user.id,
        **body.model_dump(),
    )
    session.add(product)
    await session.flush()
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    body: ProductUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Product:
    result = await session.execute(
        select(Product).where(
            Product.id == product_id, Product.dealer_id == current_user.id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    await session.flush()
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    result = await session.execute(
        select(Product).where(
            Product.id == product_id, Product.dealer_id == current_user.id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await session.delete(product)
    await session.flush()


@router.post("/{product_id}/ai-description", response_model=ProductResponse)
async def generate_ai_description(
    product_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Product:
    result = await session.execute(
        select(Product).where(
            Product.id == product_id, Product.dealer_id == current_user.id
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
    return product
