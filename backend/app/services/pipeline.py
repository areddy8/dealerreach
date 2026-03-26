"""
Pipeline service — orchestrates the dealer outreach workflow.

Stages:
1. Search: Find dealers near the customer's zip code
2. Enrich: Scrape dealer websites for contact info (email, contact forms)
3. Send: Send personalized outreach via email or contact form submission
4. Monitor: Pipeline done — reply polling handled by scheduler cron
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dealer import Dealer
from app.models.outreach_record import OutreachMethod, OutreachRecord, OutreachStatus
from app.models.pipeline_job import PipelineJob
from app.models.quote_request import QuoteRequest, QuoteRequestStatus

logger = logging.getLogger(__name__)


async def publish_event(
    redis: Redis,
    quote_request_id: uuid.UUID,
    event_type: str,
    data: Dict[str, Any],
) -> None:
    """Publish an SSE event to the Redis pub/sub channel for this quote request."""
    channel = f"quote_request:{quote_request_id}:events"
    payload = json.dumps({"event": event_type, **data})
    try:
        await redis.publish(channel, payload)
    except Exception:
        logger.warning("Failed to publish SSE event %s", event_type, exc_info=True)


async def _update_pipeline_job(
    session: AsyncSession,
    quote_request_id: uuid.UUID,
    progress_update: Dict[str, Any],
) -> None:
    """Update the pipeline job's progress dict."""
    result = await session.execute(
        select(PipelineJob)
        .where(PipelineJob.quote_request_id == quote_request_id)
        .order_by(PipelineJob.created_at.desc())
    )
    job = result.scalar_one_or_none()
    if job is not None:
        current = dict(job.progress) if job.progress else {}
        current.update(progress_update)
        job.progress = current
        await session.commit()


# ---------------------------------------------------------------------------
# Pipeline stage helpers — call into the actual pipeline sub-modules
# ---------------------------------------------------------------------------

async def _search_google_places(
    product_name: str, brand: Optional[str], zip_code: str, radius_miles: int
) -> List[Dict[str, Any]]:
    try:
        from app.pipeline.scrapers.google_places import search_google_places
        logger.info("Starting Google Maps scraper for '%s' near %s", product_name, zip_code)
        result = await search_google_places(
            product=product_name, brand=brand or "", zip_code=zip_code, radius_miles=radius_miles
        )
        logger.info("Google Maps scraper returned %d dealers", len(result))
        return result
    except Exception as e:
        logger.error("google_places scraper failed: %s", str(e), exc_info=True)
        return []


async def _search_yelp(
    product_name: str, brand: Optional[str], zip_code: str, radius_miles: int
) -> List[Dict[str, Any]]:
    try:
        from app.pipeline.scrapers.yelp import search_yelp
        logger.info("Starting Yelp scraper for '%s' near %s", product_name, zip_code)
        result = await search_yelp(
            product=product_name, brand=brand or "", zip_code=zip_code, radius_miles=radius_miles
        )
        logger.info("Yelp scraper returned %d dealers", len(result))
        return result
    except Exception as e:
        logger.error("yelp scraper failed: %s", str(e), exc_info=True)
        return []


async def _search_dealer_locator(
    dealer_locator_url: str, zip_code: str, radius_miles: int
) -> List[Dict[str, Any]]:
    try:
        from app.pipeline.scrapers.dealer_locator import scrape_dealer_locator
        return await scrape_dealer_locator(dealer_locator_url, zip_code, radius_miles)
    except Exception:
        logger.exception("dealer_locator scraper failed")
        return []


def _merge_dealers(all_results: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """Merge and deduplicate dealer results from multiple scrapers."""
    try:
        from app.pipeline.scrapers.merger import merge_dealers
        return merge_dealers(all_results)
    except ImportError:
        pass

    # Built-in simple merge/dedup
    seen: Dict[str, Dict[str, Any]] = {}
    for result_set in all_results:
        for dealer in result_set:
            key = f"{dealer.get('name', '').lower().strip()}|{dealer.get('zip_code', '')}"
            if key not in seen:
                seen[key] = dealer
            else:
                existing = seen[key]
                for field in ("email", "phone", "website"):
                    if not existing.get(field) and dealer.get(field):
                        existing[field] = dealer[field]
    return list(seen.values())


async def _enrich_contacts(dealer_records: List[Dealer], session: AsyncSession) -> None:
    """Run contact extraction on dealers. Converts ORM objects to dicts, runs
    the extractor, then writes found emails/phones back to the ORM objects."""
    try:
        from app.pipeline.contacts.extractor import extract_contacts
    except ImportError:
        logger.info("contacts.extractor not available, skipping enrichment")
        return

    # Convert ORM → dicts for the extractor
    dealer_dicts = [
        {
            "name": d.name,
            "address": d.address,
            "city": d.city,
            "state": d.state,
            "zip_code": d.zip_code,
            "phone": d.phone or "",
            "email": d.email or "",
            "website": d.website or "",
        }
        for d in dealer_records
    ]

    try:
        enriched = await extract_contacts(dealer_dicts)
    except Exception:
        logger.exception("Contact extraction failed")
        return

    # Write enriched data back to ORM objects
    for dealer, enriched_dict in zip(dealer_records, enriched):
        if enriched_dict.get("email") and not dealer.email:
            dealer.email = enriched_dict["email"]
        if enriched_dict.get("phone") and not dealer.phone:
            dealer.phone = enriched_dict["phone"]
    await session.commit()


async def _generate_email(
    dealer: Dealer, qr: QuoteRequest
) -> Optional[Dict[str, str]]:
    """Generate a personalized outreach email for a dealer."""
    try:
        from app.pipeline.outreach.personalizer import personalize_email
        dealer_dict = {
            "name": dealer.name,
            "city": dealer.city,
            "state": dealer.state,
        }
        return await personalize_email(
            dealer=dealer_dict,
            product_name=qr.product_name,
            brand=qr.brand or "",
            specs=qr.specs or "",
            reference_code=qr.reference_code,
            from_name="DealerReach Customer",
        )
    except ImportError:
        # Fallback template
        subject = (
            f"Inquiry about {qr.product_name}"
            f"{' - ' + qr.brand if qr.brand else ''}"
            f" [{qr.reference_code}]"
        )
        body = (
            f"Hello {dealer.name},\n\n"
            f"I am interested in purchasing {qr.product_name}"
            f"{' by ' + qr.brand if qr.brand else ''}.\n"
        )
        if qr.specs:
            body += f"\nSpecifications: {qr.specs}\n"
        body += (
            f"\nI am located in zip code {qr.zip_code}. "
            f"Could you please provide a quote including pricing and estimated lead time?\n\n"
            f"Please include [{qr.reference_code}] in your reply.\n\n"
            f"Thank you!"
        )
        return {"subject": subject, "body": body}
    except Exception:
        logger.exception("Email personalization failed for dealer %s", dealer.id)
        return None


async def _send_outreach_email(
    to_email: str, subject: str, body: str, reference_code: str
) -> bool:
    """Send an email via SendGrid. Returns True on success."""
    try:
        from app.pipeline.outreach.sender import send_email
        reply_to = f"quotes+{reference_code}@dealerreach.io"
        return await send_email(to_email, subject, body, reply_to)
    except ImportError:
        logger.info("outreach.sender not available; would send to %s", to_email)
        return True  # Treat as sent in dev
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

async def run_pipeline(
    quote_request_id: uuid.UUID,
    session: AsyncSession,
    redis: Redis,
) -> None:
    """
    Main pipeline entrypoint. Called by the ARQ worker task.
    """
    result = await session.execute(
        select(QuoteRequest).where(QuoteRequest.id == quote_request_id)
    )
    qr = result.scalar_one_or_none()
    if qr is None:
        raise ValueError(f"QuoteRequest {quote_request_id} not found")

    errors: List[str] = []

    # ------------------------------------------------------------------
    # Stage 1: Searching
    # ------------------------------------------------------------------
    qr.status = QuoteRequestStatus.searching
    await session.commit()

    await publish_event(redis, quote_request_id, "stage_started", {
        "stage": "searching",
        "message": "Searching for dealers near your location...",
    })
    await _update_pipeline_job(session, quote_request_id, {
        "current_stage": "searching",
        "stages_completed": [],
        "dealer_count": 0,
        "emails_sent": 0,
        "errors": [],
    })

    # Auto-discover dealer locator URL if not provided
    dealer_locator_url = qr.dealer_locator_url
    if not dealer_locator_url and qr.brand:
        try:
            from app.pipeline.scrapers.dealer_locator import discover_dealer_locator_url
            discovered = await discover_dealer_locator_url(qr.brand)
            if discovered:
                dealer_locator_url = discovered
                logger.info("Auto-discovered dealer locator: %s", discovered)
        except Exception:
            logger.warning("Dealer locator auto-discovery failed", exc_info=True)

    # Run scrapers in parallel
    tasks = [
        _search_google_places(qr.product_name, qr.brand, qr.zip_code, qr.radius_miles),
        _search_yelp(qr.product_name, qr.brand, qr.zip_code, qr.radius_miles),
    ]
    if dealer_locator_url:
        tasks.append(
            _search_dealer_locator(dealer_locator_url, qr.zip_code, qr.radius_miles)
        )

    scraper_results = await asyncio.gather(*tasks, return_exceptions=True)

    valid_results: List[List[Dict[str, Any]]] = []
    for i, res in enumerate(scraper_results):
        if isinstance(res, Exception):
            error_msg = f"Scraper {i} failed: {res}"
            logger.warning(error_msg)
            errors.append(error_msg)
        elif isinstance(res, list):
            valid_results.append(res)

    merged = _merge_dealers(valid_results)

    # Filter out repair/service companies — only keep dealers and retail stores
    _exclude = [
        "repair", "support", "fix", "maintenance", "parts",
        "technician", "tech", "plumber", "plumbing", "hvac",
        "handyman", "restoration", "hauling", "cleaning",
    ]
    filtered = []
    for d in merged:
        name_lower = d.get("name", "").lower()
        if any(kw in name_lower for kw in _exclude):
            logger.warning("Filtered out non-dealer: %s", d.get("name"))
            continue
        filtered.append(d)
    logger.warning("Dealers: %d found, %d after filtering for QR %s",
                    len(merged), len(filtered), quote_request_id)
    merged = filtered

    # Save Dealer records to DB
    dealer_records: List[Dealer] = []
    for d in merged:
        dealer = Dealer(
            quote_request_id=quote_request_id,
            name=d.get("name", "Unknown"),
            address=d.get("address", ""),
            city=d.get("city", ""),
            state=d.get("state", ""),
            zip_code=d.get("zip_code", ""),
            phone=d.get("phone") or None,
            email=d.get("email") or None,
            website=d.get("website") or None,
            source=d.get("source", "unknown"),
        )
        session.add(dealer)
        dealer_records.append(dealer)
    await session.flush()
    await session.commit()

    await publish_event(redis, quote_request_id, "stage_completed", {
        "stage": "searching",
        "dealer_count": len(dealer_records),
        "message": f"Found {len(dealer_records)} dealer(s)",
    })
    await _update_pipeline_job(session, quote_request_id, {
        "stages_completed": ["searching"],
        "current_stage": "enriching",
        "dealer_count": len(dealer_records),
        "errors": errors,
    })

    # ------------------------------------------------------------------
    # Stage 2: Enriching
    # ------------------------------------------------------------------
    qr.status = QuoteRequestStatus.enriching
    await session.commit()

    await publish_event(redis, quote_request_id, "stage_started", {
        "stage": "enriching",
        "message": "Enriching dealer contact information...",
    })

    await _enrich_contacts(dealer_records, session)

    email_count = sum(1 for d in dealer_records if d.email)
    await publish_event(redis, quote_request_id, "stage_completed", {
        "stage": "enriching",
        "dealers_with_email": email_count,
        "message": f"Found emails for {email_count} dealer(s)",
    })
    await _update_pipeline_job(session, quote_request_id, {
        "stages_completed": ["searching", "enriching"],
        "current_stage": "sending",
    })

    # ------------------------------------------------------------------
    # Stage 3: Sending
    # ------------------------------------------------------------------
    qr.status = QuoteRequestStatus.sending
    await session.commit()

    await publish_event(redis, quote_request_id, "stage_started", {
        "stage": "sending",
        "message": "Sending outreach emails to dealers...",
    })

    emails_sent = 0
    emails_failed = 0

    for dealer in dealer_records:
        if dealer.email:
            email_content = await _generate_email(dealer, qr)
            if email_content is None:
                errors.append(f"Failed to personalize email for {dealer.name}")
                continue

            success = await _send_outreach_email(
                dealer.email,
                email_content["subject"],
                email_content["body"],
                qr.reference_code,
            )

            outreach = OutreachRecord(
                dealer_id=dealer.id,
                quote_request_id=quote_request_id,
                method=OutreachMethod.email,
                status=OutreachStatus.sent if success else OutreachStatus.failed,
                email_subject=email_content["subject"],
                email_body=email_content["body"],
                sent_at=datetime.now(timezone.utc) if success else None,
                error_message=None if success else "Send failed",
            )
            session.add(outreach)

            if success:
                emails_sent += 1
            else:
                emails_failed += 1

        elif dealer.website:
            outreach = OutreachRecord(
                dealer_id=dealer.id,
                quote_request_id=quote_request_id,
                method=OutreachMethod.contact_form,
                status=OutreachStatus.pending,
            )
            session.add(outreach)

    await session.commit()

    await publish_event(redis, quote_request_id, "stage_completed", {
        "stage": "sending",
        "emails_sent": emails_sent,
        "emails_failed": emails_failed,
        "message": f"Sent {emails_sent} email(s), {emails_failed} failed",
    })
    await _update_pipeline_job(session, quote_request_id, {
        "stages_completed": ["searching", "enriching", "sending"],
        "current_stage": "monitoring",
        "emails_sent": emails_sent,
        "errors": errors,
    })

    # ------------------------------------------------------------------
    # Stage 4: Monitoring
    # ------------------------------------------------------------------
    qr.status = QuoteRequestStatus.monitoring
    await session.commit()

    await publish_event(redis, quote_request_id, "stage_started", {
        "stage": "monitoring",
        "message": "Pipeline complete. Monitoring for dealer replies...",
    })
    await _update_pipeline_job(session, quote_request_id, {
        "stages_completed": ["searching", "enriching", "sending", "monitoring"],
        "current_stage": None,
    })

    logger.info(
        "Pipeline complete for QR %s: %d dealers, %d emails sent",
        quote_request_id,
        len(dealer_records),
        emails_sent,
    )
