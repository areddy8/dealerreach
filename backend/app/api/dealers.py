from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.dealer import Dealer
from app.models.quote_request import QuoteRequest
from app.models.user import User
from app.schemas.dealer import DealerResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/quote-requests/{quote_request_id}/dealers", tags=["dealers"])


@router.get("", response_model=List[DealerResponse])
async def list_dealers(
    quote_request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Verify ownership
    result = await session.execute(
        select(QuoteRequest).where(QuoteRequest.id == quote_request_id)
    )
    qr = result.scalar_one_or_none()
    if qr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
    if qr.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    result = await session.execute(
        select(Dealer)
        .where(Dealer.quote_request_id == quote_request_id)
        .order_by(Dealer.created_at.desc())
    )
    dealers = result.scalars().all()
    return dealers
