from __future__ import annotations

import asyncio
import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.rate_limit import RateLimit
from app.database import get_session
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify-email", status_code=200)
async def verify_email(token: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(User).where(User.verification_token == token)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification token"
        )
    user.email_verified = True
    user.verification_token = None
    await session.flush()
    return {"message": "Email verified successfully"}


@router.post(
    "/resend-verification",
    status_code=204,
    dependencies=[Depends(RateLimit(max_requests=3, window_seconds=300))],
)
async def resend_verification(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.email_verified:
        return
    token = secrets.token_urlsafe(32)
    # Merge attached user into this session
    result = await session.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one()
    user.verification_token = token
    await session.flush()
    # Send verification email (fire-and-forget)
    asyncio.create_task(_send_verification_email(user.name, user.email, token))


async def _send_verification_email(
    user_name: str, user_email: str, token: str
) -> None:
    try:
        from app.config import settings
        from app.pipeline.outreach.sender import send_email
        from app.templates.emails import render_verification_email, strip_html

        verify_url = f"https://www.dealerreach.io/verify-email?token={token}"
        html_body = render_verification_email(user_name, verify_url)
        await send_email(
            to_email=user_email,
            subject="Verify your DealerReach.io email",
            body=strip_html(html_body),
            reply_to=settings.SENDGRID_FROM_EMAIL,
            html_body=html_body,
        )
    except Exception:
        logger.warning("Failed to send verification email", exc_info=True)
