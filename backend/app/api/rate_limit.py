"""Rate limiting using Redis sliding window."""
import logging
import time
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)


async def _get_redis() -> Optional[Redis]:
    """Create a Redis connection for rate limiting."""
    try:
        r = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        return r
    except Exception:
        logger.warning("Redis unavailable for rate limiting; allowing request through")
        return None


class RateLimit:
    """FastAPI dependency for per-endpoint rate limiting.

    Usage:
        @router.post("/signup", dependencies=[Depends(RateLimit(5, 60))])
        async def signup(...): ...
    """

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request) -> None:
        redis = await _get_redis()
        if redis is None:
            # Redis down — fail open
            return

        try:
            # Determine identifier: user_id if authenticated, else client IP
            identifier: Optional[str] = None
            auth_header = request.headers.get("authorization", "")
            if auth_header.startswith("Bearer "):
                # Attempt to decode token for user_id without raising
                try:
                    from app.services.auth_service import decode_access_token

                    token = auth_header.split(" ", 1)[1]
                    user_id = decode_access_token(token)
                    if user_id is not None:
                        identifier = f"user:{user_id}"
                except Exception:
                    pass

            if identifier is None:
                identifier = f"ip:{request.client.host}" if request.client else "ip:unknown"

            endpoint = request.url.path
            key = f"rate_limit:{identifier}:{endpoint}"

            # Sliding window using INCR + EXPIRE
            current = await redis.incr(key)
            if current == 1:
                await redis.expire(key, self.window_seconds)

            if current > self.max_requests:
                ttl = await redis.ttl(key)
                retry_after = max(ttl, 1)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Try again later.",
                    headers={"Retry-After": str(retry_after)},
                )
        except HTTPException:
            raise
        except Exception:
            logger.warning("Rate limit check failed; allowing request through", exc_info=True)
        finally:
            try:
                await redis.aclose()
            except Exception:
                pass
