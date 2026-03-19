from __future__ import annotations

import asyncio
import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.database import get_session
from app.models.quote_request import QuoteRequest
from app.models.user import User
from app.services.auth_service import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["events"])

_KEEPALIVE_INTERVAL = 30  # seconds


async def _event_generator(quote_request_id: uuid.UUID):
    """
    SSE event generator that subscribes to Redis pub/sub channel
    ``quote_request:{id}:events`` and yields events to the client.
    """
    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = redis.pubsub()
    channel = f"quote_request:{quote_request_id}:events"

    try:
        await pubsub.subscribe(channel)
        # Consume the subscription confirmation message
        await pubsub.get_message(timeout=1.0)

        # Send initial connection event
        yield {
            "event": "connected",
            "data": json.dumps({
                "quote_request_id": str(quote_request_id),
                "message": "Connected to event stream",
            }),
        }

        seconds_since_keepalive = 0
        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True, timeout=0.1
            )
            if message and message["type"] == "message":
                raw = message["data"]
                data = json.loads(raw)
                event_type = data.pop("event", "update")
                yield {
                    "event": event_type,
                    "data": json.dumps(data),
                }
                seconds_since_keepalive = 0
            else:
                seconds_since_keepalive += 1
                if seconds_since_keepalive >= _KEEPALIVE_INTERVAL * 10:
                    seconds_since_keepalive = 0
                    yield {
                        "event": "ping",
                        "data": json.dumps({"type": "keepalive"}),
                    }
                await asyncio.sleep(0.1)

    except asyncio.CancelledError:
        pass
    except Exception:
        logger.exception("SSE event generator error for QR %s", quote_request_id)
    finally:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.aclose()
            await redis.aclose()
        except Exception:
            logger.debug("Error closing SSE redis connection", exc_info=True)


@router.get("/{quote_request_id}")
async def event_stream(
    quote_request_id: uuid.UUID,
    token: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
):
    """SSE endpoint. Accepts JWT via query param `?token=` since EventSource
    cannot set Authorization headers."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required (pass as ?token= query parameter)",
        )

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Verify ownership
    result = await session.execute(
        select(QuoteRequest).where(QuoteRequest.id == quote_request_id)
    )
    qr = result.scalar_one_or_none()
    if qr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
    if qr.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return EventSourceResponse(_event_generator(quote_request_id))
