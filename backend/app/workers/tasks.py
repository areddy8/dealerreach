"""
ARQ worker tasks for background processing.

Usage:
    arq app.workers.tasks.WorkerSettings
"""
from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone

from arq.connections import RedisSettings
from redis.asyncio import Redis
from sqlalchemy import select

from app.config import settings
from app.database import async_session_factory
from app.models.pipeline_job import PipelineJob, PipelineJobStatus
from app.models.quote_request import QuoteRequest, QuoteRequestStatus
from app.services.pipeline import publish_event, run_pipeline

logger = logging.getLogger(__name__)


async def run_pipeline_task(ctx: dict, quote_request_id: str) -> None:
    """
    ARQ task: run the full dealer outreach pipeline for a quote request.
    Updates pipeline_job status as it progresses.
    """
    qr_id = uuid.UUID(quote_request_id)
    logger.info("Starting pipeline task for quote_request_id=%s", qr_id)

    async with async_session_factory() as session:
        # Find the pipeline job
        result = await session.execute(
            select(PipelineJob)
            .where(PipelineJob.quote_request_id == qr_id)
            .order_by(PipelineJob.created_at.desc())
        )
        job = result.scalar_one_or_none()

        if job is None:
            logger.error("No pipeline job found for quote_request_id=%s", qr_id)
            return

        # Mark as running
        job.status = PipelineJobStatus.running
        job.started_at = datetime.now(timezone.utc)
        job.progress = {
            "stages_completed": [],
            "current_stage": "searching",
            "dealer_count": 0,
            "emails_sent": 0,
            "errors": [],
        }
        await session.commit()

        redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

        try:
            await publish_event(redis, qr_id, "pipeline_started", {
                "quote_request_id": str(qr_id),
                "message": "Pipeline started",
            })

            # Run the full pipeline
            await run_pipeline(qr_id, session, redis)

            # Re-fetch the job to get latest progress (pipeline updates it)
            await session.refresh(job)

            # Mark as completed
            job.status = PipelineJobStatus.completed
            job.completed_at = datetime.now(timezone.utc)
            if job.progress:
                progress = dict(job.progress)
                progress["current_stage"] = None
                job.progress = progress
            await session.commit()

            await publish_event(redis, qr_id, "pipeline_completed", {
                "quote_request_id": str(qr_id),
                "message": "Pipeline completed successfully",
                "progress": job.progress,
            })

        except Exception as e:
            logger.exception("Pipeline failed for quote_request_id=%s", qr_id)

            # Re-fetch to avoid stale state
            await session.refresh(job)

            job.status = PipelineJobStatus.failed
            job.error_message = str(e)
            job.completed_at = datetime.now(timezone.utc)

            # Also update quote_request status back to pending
            qr_result = await session.execute(
                select(QuoteRequest).where(QuoteRequest.id == qr_id)
            )
            qr = qr_result.scalar_one_or_none()
            if qr:
                qr.status = QuoteRequestStatus.pending

            await session.commit()

            # Publish error event
            try:
                await publish_event(redis, qr_id, "pipeline_error", {
                    "quote_request_id": str(qr_id),
                    "error": str(e),
                    "message": "Pipeline failed",
                })
            except Exception:
                logger.debug("Failed to publish error event", exc_info=True)

        finally:
            try:
                await redis.aclose()
            except Exception:
                logger.debug("Failed to close redis connection", exc_info=True)


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


class WorkerSettings:
    """ARQ worker settings."""

    functions = [run_pipeline_task]
    redis_settings = _parse_redis_url(settings.REDIS_URL)
    max_jobs = 5
    job_timeout = 600  # 10 minutes
