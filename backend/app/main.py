from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, email_verification, password_reset, quote_requests, dealers, replies, events, export

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("DealerReach API starting up (env=%s)", settings.ENVIRONMENT)
    yield
    logger.info("DealerReach API shutting down")


app = FastAPI(
    title="DealerReach.io API",
    description="Get dealer pricing on products sold through dealer networks",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(password_reset.router)
app.include_router(email_verification.router)
app.include_router(quote_requests.router)
app.include_router(dealers.router)
app.include_router(replies.router)
app.include_router(events.router)
app.include_router(export.router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "dealerreach-api"}


if settings.ENVIRONMENT == "development":
    @app.post("/debug/publish/{quote_request_id}", tags=["debug"])
    async def debug_publish(quote_request_id: str):
        """Debug endpoint to test SSE pub/sub."""
        import json
        from redis.asyncio import Redis
        redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        channel = f"quote_request:{quote_request_id}:events"
        count = await redis.publish(channel, json.dumps({
            "event": "debug_test",
            "message": "Published from server process",
        }))
        await redis.aclose()
        return {"published_to": count, "channel": channel}
