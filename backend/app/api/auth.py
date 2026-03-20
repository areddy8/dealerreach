from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.rate_limit import RateLimit
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth_service import create_access_token, hash_password, verify_password
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimit(max_requests=5, window_seconds=60))],
)
async def signup(body: SignupRequest, session: AsyncSession = Depends(get_session)):
    # Check for existing user
    result = await session.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
    )
    session.add(user)
    await session.flush()

    access_token = create_access_token(user.id)

    # Fire-and-forget welcome email
    asyncio.create_task(_send_welcome_email(user.name, user.email))

    return TokenResponse(access_token=access_token)


async def _send_welcome_email(user_name: str, user_email: str) -> None:
    """Send a branded welcome email in the background."""
    try:
        from app.config import settings
        from app.templates.emails import render_welcome_email, strip_html
        from app.pipeline.outreach.sender import send_email

        html_body = render_welcome_email(user_name)
        plain_body = strip_html(html_body)

        await send_email(
            to_email=user_email,
            subject="Welcome to DealerReach.io!",
            body=plain_body,
            reply_to=settings.SENDGRID_FROM_EMAIL,
            html_body=html_body,
        )
    except Exception:
        logger.warning("Failed to send welcome email to %s", user_email, exc_info=True)


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(RateLimit(max_requests=10, window_seconds=60))],
)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
