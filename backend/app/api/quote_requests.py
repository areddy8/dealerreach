from __future__ import annotations

import logging
import random
import string
import uuid
from typing import List
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.rate_limit import RateLimit
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models.pipeline_job import PipelineJob, PipelineJobStatus
from app.models.quote_request import QuoteRequest, QuoteRequestStatus
from app.models.user import User
from app.schemas.quote_request import (
    CreateQuoteRequest,
    QuoteRequestDetail,
    QuoteRequestResponse,
)
from app.api.deps import get_current_user
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quote-requests", tags=["quote-requests"])


def _generate_reference_code() -> str:
    """Generate a reference code like DR-A7F3K2."""
    chars = string.ascii_uppercase + string.digits
    code = "".join(random.choices(chars, k=6))
    return f"DR-{code}"


async def _unique_reference_code(session: AsyncSession) -> str:
    """Generate a reference code that doesn't already exist in the DB."""
    for _ in range(10):
        code = _generate_reference_code()
        result = await session.execute(
            select(QuoteRequest).where(QuoteRequest.reference_code == code)
        )
        if result.scalar_one_or_none() is None:
            return code
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate unique reference code",
    )


async def _get_user_quote_request(
    quote_request_id: uuid.UUID,
    user: User,
    session: AsyncSession,
) -> QuoteRequest:
    """Fetch a quote request and verify it belongs to the current user."""
    result = await session.execute(
        select(QuoteRequest).where(QuoteRequest.id == quote_request_id)
    )
    qr = result.scalar_one_or_none()
    if qr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
    if qr.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return qr


@router.post(
    "",
    response_model=QuoteRequestResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimit(max_requests=10, window_seconds=3600))],
)
async def create_quote_request(
    body: CreateQuoteRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    reference_code = await _unique_reference_code(session)

    qr = QuoteRequest(
        user_id=current_user.id,
        product_name=body.product_name,
        brand=body.brand,
        specs=body.specs,
        zip_code=body.zip_code,
        radius_miles=body.radius_miles,
        dealer_locator_url=body.dealer_locator_url,
        reference_code=reference_code,
    )
    session.add(qr)
    await session.flush()

    # Create pipeline job
    pipeline_job = PipelineJob(
        quote_request_id=qr.id,
        status=PipelineJobStatus.queued,
        progress={"stages_completed": [], "current_stage": None, "dealer_count": 0},
    )
    session.add(pipeline_job)
    await session.flush()

    # Enqueue the ARQ pipeline task
    try:
        from arq.connections import create_pool, RedisSettings

        parsed_url = urlparse(settings.REDIS_URL)
        redis_pool = await create_pool(RedisSettings(
            host=parsed_url.hostname or "localhost",
            port=parsed_url.port or 6379,
            database=int(parsed_url.path.lstrip("/") or "0"),
            password=parsed_url.password,
        ))
        await redis_pool.enqueue_job("run_pipeline_task", str(qr.id))
        await redis_pool.close()
    except Exception as e:
        logger.warning("Failed to enqueue pipeline task: %s", e)
        # Non-fatal — job can be retried manually

    return QuoteRequestResponse(
        id=qr.id,
        product_name=qr.product_name,
        brand=qr.brand,
        specs=qr.specs,
        zip_code=qr.zip_code,
        radius_miles=qr.radius_miles,
        dealer_locator_url=qr.dealer_locator_url,
        reference_code=qr.reference_code,
        status=qr.status.value,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
        dealer_count=0,
        reply_count=0,
    )


@router.get(
    "",
    response_model=List[QuoteRequestResponse],
    dependencies=[Depends(RateLimit(max_requests=30, window_seconds=60))],
)
async def list_quote_requests(
    include_archived: bool = False,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    query = (
        select(QuoteRequest)
        .where(QuoteRequest.user_id == current_user.id)
        .options(selectinload(QuoteRequest.dealers), selectinload(QuoteRequest.replies))
        .order_by(QuoteRequest.created_at.desc())
    )
    if not include_archived:
        query = query.where(QuoteRequest.status != QuoteRequestStatus.archived)
    result = await session.execute(query)
    requests = result.scalars().all()

    return [
        QuoteRequestResponse(
            id=qr.id,
            product_name=qr.product_name,
            brand=qr.brand,
            specs=qr.specs,
            zip_code=qr.zip_code,
            radius_miles=qr.radius_miles,
            dealer_locator_url=qr.dealer_locator_url,
            reference_code=qr.reference_code,
            status=qr.status.value,
            created_at=qr.created_at,
            updated_at=qr.updated_at,
            dealer_count=len(qr.dealers),
            reply_count=len(qr.replies),
        )
        for qr in requests
    ]


@router.get("/{quote_request_id}", response_model=QuoteRequestDetail)
async def get_quote_request(
    quote_request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(QuoteRequest)
        .where(QuoteRequest.id == quote_request_id)
        .options(selectinload(QuoteRequest.dealers), selectinload(QuoteRequest.replies))
    )
    qr = result.scalar_one_or_none()
    if qr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
    if qr.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return QuoteRequestDetail(
        id=qr.id,
        product_name=qr.product_name,
        brand=qr.brand,
        specs=qr.specs,
        zip_code=qr.zip_code,
        radius_miles=qr.radius_miles,
        dealer_locator_url=qr.dealer_locator_url,
        reference_code=qr.reference_code,
        status=qr.status.value,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
        dealers=qr.dealers,
        replies=qr.replies,
    )


@router.patch("/{quote_request_id}/archive", response_model=QuoteRequestResponse)
async def archive_quote_request(
    quote_request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    qr = await _get_user_quote_request(quote_request_id, current_user, session)
    qr.status = QuoteRequestStatus.archived
    await session.flush()

    # Reload with relationships for counts
    result = await session.execute(
        select(QuoteRequest)
        .where(QuoteRequest.id == qr.id)
        .options(selectinload(QuoteRequest.dealers), selectinload(QuoteRequest.replies))
    )
    qr = result.scalar_one()

    return QuoteRequestResponse(
        id=qr.id,
        product_name=qr.product_name,
        brand=qr.brand,
        specs=qr.specs,
        zip_code=qr.zip_code,
        radius_miles=qr.radius_miles,
        dealer_locator_url=qr.dealer_locator_url,
        reference_code=qr.reference_code,
        status=qr.status.value,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
        dealer_count=len(qr.dealers),
        reply_count=len(qr.replies),
    )


@router.delete("/{quote_request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote_request(
    quote_request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    qr = await _get_user_quote_request(quote_request_id, current_user, session)
    await session.delete(qr)
    await session.flush()
