from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import (
    auth,
    email_verification,
    password_reset,
    # Old consumer routers (no longer used in dealer SaaS pivot):
    # quote_requests, dealers, replies, events, export,
    products,
    clients,
    projects,
    ai_curator,
    client_portal,
    public,
)

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
    title="DealerReach API — Luxury Dealer SaaS",
    description="B2B SaaS platform for luxury appliance dealers to manage products, clients, and projects",
    version="0.2.0",
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
# Old consumer routers removed in dealer SaaS pivot:
# app.include_router(quote_requests.router)
# app.include_router(dealers.router)
# app.include_router(replies.router)
# app.include_router(events.router)
# app.include_router(export.router)
app.include_router(products.router)
app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(ai_curator.router)
app.include_router(client_portal.router)
app.include_router(public.router)


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
