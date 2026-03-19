"""
Scheduled tasks — run on a cron schedule via ARQ.

The primary scheduled task is polling for email replies every 5 minutes.

Usage:
    arq app.workers.scheduler.SchedulerSettings
"""
from __future__ import annotations

import logging
from typing import Optional, Set

from arq.connections import RedisSettings
from arq.cron import cron

from app.config import settings
from app.services.email_router import poll_replies

logger = logging.getLogger(__name__)


async def poll_replies_task(ctx: dict) -> int:
    """
    Cron task: poll the inbox for new dealer replies.
    """
    logger.info("Running scheduled poll_replies task")
    try:
        count = await poll_replies()
        logger.info("poll_replies found %d new replies", count)
        return count
    except Exception:
        logger.exception("poll_replies task failed")
        return 0


def _parse_redis_url(url: str) -> RedisSettings:
    """Parse a redis:// URL into ARQ RedisSettings."""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    return RedisSettings(
        host=parsed.hostname or "localhost",
        port=parsed.port or 6379,
        database=int(parsed.path.lstrip("/") or "0"),
        password=parsed.password,
    )


class SchedulerSettings:
    """ARQ worker settings with cron-scheduled reply polling."""

    functions = [poll_replies_task]
    redis_settings = _parse_redis_url(settings.REDIS_URL)

    cron_jobs = [
        cron(
            poll_replies_task,
            minute={0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55},
            run_at_startup=True,
        ),
    ]
