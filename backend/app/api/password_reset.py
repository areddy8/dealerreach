from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.rate_limit import RateLimit
from app.database import get_session
from app.models.user import User
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, TokenResponse
from app.services.auth_service import (
    create_access_token,
    create_reset_token,
    create_reset_token_expiry,
    hash_password,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/forgot-password",
    status_code=204,
    dependencies=[Depends(RateLimit(max_requests=5, window_seconds=300))],
)
async def forgot_password(
    body: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is not None:
        token = create_reset_token()
        user.reset_token = token
        user.reset_token_expires = create_reset_token_expiry()
        await session.flush()

        # Fire-and-forget reset email
        asyncio.create_task(
            _send_reset_email(user.name, user.email, token)
        )

    # Always return 204 — don't reveal whether the email exists
    return None


async def _send_reset_email(user_name: str, user_email: str, token: str) -> None:
    """Send a branded password reset email in the background."""
    try:
        from app.config import settings
        from app.templates.emails import render_password_reset_email, strip_html
        from app.pipeline.outreach.sender import send_email

        reset_url = f"https://www.dealerreach.io/reset-password?token={token}"
        html_body = render_password_reset_email(user_name, reset_url)
        plain_body = strip_html(html_body)

        await send_email(
            to_email=user_email,
            subject="Reset your DealerReach.io password",
            body=plain_body,
            reply_to=settings.SENDGRID_FROM_EMAIL,
            html_body=html_body,
        )
    except Exception:
        logger.warning("Failed to send reset email to %s", user_email, exc_info=True)


@router.post("/reset-password", response_model=TokenResponse)
async def reset_password(
    body: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(User).where(User.reset_token == body.token)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    if user.reset_token_expires is None or user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user.password_hash = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await session.flush()

    access_token = create_access_token(user.id)
    return TokenResponse(access_token=access_token)
