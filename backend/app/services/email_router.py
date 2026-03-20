"""
Email router service — matches incoming email replies to quote requests.

Connects to IMAP inbox, fetches new unread messages, matches each reply to an
outreach_record using reference codes in the subject or plus-addressing, then
uses Claude to parse price/lead-time/availability from the reply body.
"""
from __future__ import annotations

import asyncio
import email
import email.policy
import imaplib
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.config import settings

logger = logging.getLogger(__name__)

# Pattern to match reference codes like [DR-A7F3K2]
_REF_CODE_PATTERN = re.compile(r"\[DR-([A-Z0-9]{6})\]")
# Pattern to match plus-addressing like quotes+DR-A7F3K2@domain.com
_PLUS_ADDR_PATTERN = re.compile(r"quotes\+DR-([A-Z0-9]{6})@", re.IGNORECASE)


async def poll_replies() -> int:
    """
    Poll the inbox for new replies and process them.
    Returns the number of new replies found.
    """
    if not settings.IMAP_USER or not settings.IMAP_PASSWORD:
        logger.warning(
            "IMAP credentials not configured (IMAP_USER / IMAP_PASSWORD empty), "
            "skipping reply polling"
        )
        return 0

    count = await asyncio.to_thread(_poll_replies_sync)
    return count


def _poll_replies_sync() -> int:
    """Synchronous IMAP polling — runs inside asyncio.to_thread."""
    try:
        mail = imaplib.IMAP4_SSL(settings.IMAP_HOST)
        mail.login(settings.IMAP_USER, settings.IMAP_PASSWORD)
        mail.select("INBOX")
    except Exception:
        logger.exception("Failed to connect to IMAP server %s", settings.IMAP_HOST)
        return 0

    try:
        status, data = mail.search(None, "UNSEEN")
        if status != "OK" or not data or not data[0]:
            logger.debug("No unseen messages found")
            return 0

        message_ids = data[0].split()
        logger.info("Found %d unseen message(s)", len(message_ids))

        processed = 0
        for msg_id in message_ids:
            try:
                ok = _process_single_message(mail, msg_id)
                if ok:
                    processed += 1
            except Exception:
                logger.exception("Failed to process message %s", msg_id)

        return processed
    finally:
        try:
            mail.logout()
        except Exception:
            pass


def _process_single_message(mail: imaplib.IMAP4_SSL, msg_id: bytes) -> bool:
    """Fetch, parse, and process a single email message."""
    status, msg_data = mail.fetch(msg_id, "(RFC822)")
    if status != "OK" or not msg_data or not msg_data[0]:
        return False

    raw_email = msg_data[0][1]
    if isinstance(raw_email, bytes):
        msg = email.message_from_bytes(raw_email, policy=email.policy.default)
    else:
        msg = email.message_from_string(raw_email, policy=email.policy.default)

    from_addr = msg.get("From", "")
    subject = msg.get("Subject", "")
    to_addr = msg.get("To", "")
    cc_addr = msg.get("Cc", "")
    body = _extract_body(msg)

    ref_code = _extract_reference_code(subject, to_addr, cc_addr, body)
    if ref_code is None:
        logger.debug("No reference code found in message from %s", from_addr)
        mail.store(msg_id, "+FLAGS", "\\Seen")
        return False

    sender_email = _extract_email_address(from_addr)
    if not sender_email:
        logger.warning("Could not extract sender email from: %s", from_addr)
        mail.store(msg_id, "+FLAGS", "\\Seen")
        return False

    # Schedule async DB work on the running event loop
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            future = asyncio.run_coroutine_threadsafe(
                _process_reply_async(ref_code, sender_email, subject, body),
                loop,
            )
            return future.result(timeout=30)
        else:
            return asyncio.run(
                _process_reply_async(ref_code, sender_email, subject, body)
            )
    except Exception:
        logger.exception(
            "Failed to process reply from %s for ref %s", sender_email, ref_code
        )
        return False
    finally:
        mail.store(msg_id, "+FLAGS", "\\Seen")


async def _process_reply_async(
    ref_code: str, sender_email: str, subject: str, body: str
) -> bool:
    """
    Async processing: look up the quote request, dealer, outreach record,
    parse the reply, save to DB, publish SSE event, and notify the user.
    """
    from sqlalchemy import select
    from redis.asyncio import Redis

    from app.database import async_session_factory
    from app.models.dealer import Dealer
    from app.models.outreach_record import OutreachRecord, OutreachStatus
    from app.models.quote_request import QuoteRequest
    from app.models.reply import Reply
    from app.models.user import User
    from app.services.pipeline import publish_event

    full_ref_code = f"DR-{ref_code}"

    async with async_session_factory() as session:
        # Look up quote request by reference code
        result = await session.execute(
            select(QuoteRequest).where(QuoteRequest.reference_code == full_ref_code)
        )
        qr = result.scalar_one_or_none()
        if qr is None:
            logger.warning("No quote request found for reference code %s", full_ref_code)
            return False

        # Find dealer by sender email / domain match
        sender_domain = sender_email.split("@")[-1].lower()
        result = await session.execute(
            select(Dealer).where(Dealer.quote_request_id == qr.id)
        )
        dealers = result.scalars().all()

        matched_dealer = None  # type: Optional[Dealer]

        # Try exact email match first
        for dealer in dealers:
            if dealer.email and dealer.email.lower() == sender_email.lower():
                matched_dealer = dealer
                break

        # Then try domain match
        if matched_dealer is None:
            for dealer in dealers:
                if dealer.email and sender_domain in dealer.email.lower():
                    matched_dealer = dealer
                    break
                if dealer.website and sender_domain in dealer.website.lower():
                    matched_dealer = dealer
                    break

        if matched_dealer is None:
            logger.warning(
                "Could not match sender %s to any dealer for QR %s",
                sender_email, qr.id,
            )
            return False

        # Find outreach record for this dealer + quote request
        result = await session.execute(
            select(OutreachRecord).where(
                OutreachRecord.dealer_id == matched_dealer.id,
                OutreachRecord.quote_request_id == qr.id,
            )
        )
        outreach = result.scalar_one_or_none()
        if outreach is None:
            logger.warning(
                "No outreach record found for dealer %s / QR %s",
                matched_dealer.id, qr.id,
            )
            return False

        # Parse the reply with Claude
        parsed = await parse_reply_content(body)

        # Create Reply record
        reply = Reply(
            outreach_record_id=outreach.id,
            quote_request_id=qr.id,
            dealer_id=matched_dealer.id,
            raw_body=body,
            parsed_price=parsed.get("price"),
            parsed_lead_time=parsed.get("lead_time"),
            parsed_availability=parsed.get("availability"),
            parsed_summary=parsed.get("summary"),
            received_at=datetime.now(timezone.utc),
        )
        session.add(reply)

        # Update outreach record status
        outreach.status = OutreachStatus.replied
        await session.commit()

        # Publish SSE event
        try:
            redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
            await publish_event(redis, qr.id, "reply_received", {
                "dealer_name": matched_dealer.name,
                "dealer_id": str(matched_dealer.id),
                "parsed_price": str(parsed.get("price")) if parsed.get("price") else None,
                "parsed_summary": parsed.get("summary"),
                "message": f"Reply received from {matched_dealer.name}",
            })
            await redis.aclose()
        except Exception:
            logger.debug("Failed to publish reply SSE event", exc_info=True)

        # Send notification email to the user
        await _notify_user_of_reply(session, qr, matched_dealer, parsed)

        logger.info(
            "Processed reply from %s for QR %s (dealer: %s)",
            sender_email, qr.id, matched_dealer.name,
        )
        return True


async def _notify_user_of_reply(
    session: Any,
    qr: Any,
    dealer: Any,
    parsed: Dict[str, Any],
) -> None:
    """Send a notification email to the user when a dealer replies."""
    from sqlalchemy import select
    from app.models.user import User
    from app.templates.emails import render_reply_notification, strip_html

    result = await session.execute(
        select(User).where(User.id == qr.user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        return

    dashboard_url = "https://www.dealerreach.io/dashboard/{}".format(qr.id)

    subject = "[DealerReach] {} replied to your inquiry [{}]".format(
        dealer.name, qr.reference_code,
    )

    html_body = render_reply_notification(
        user_name=user.name,
        dealer_name=dealer.name,
        product_name=qr.product_name,
        reference_code=qr.reference_code,
        price=parsed.get("price"),
        lead_time=parsed.get("lead_time"),
        availability=parsed.get("availability"),
        summary=parsed.get("summary"),
        dashboard_url=dashboard_url,
    )

    plain_body = strip_html(html_body)

    try:
        from app.pipeline.outreach.sender import send_email
        await send_email(
            to_email=user.email,
            subject=subject,
            body=plain_body,
            reply_to=settings.SENDGRID_FROM_EMAIL,
            html_body=html_body,
        )
        logger.info("Notification email sent to %s for QR %s", user.email, qr.id)
    except Exception:
        logger.warning("Failed to send notification email to %s", user.email, exc_info=True)


def _extract_reference_code(
    subject: str, to_addr: str, cc_addr: str, body: str
) -> Optional[str]:
    """Extract the 6-char reference code. Returns the code (without DR- prefix) or None."""
    # Check subject for [DR-XXXXXX]
    m = _REF_CODE_PATTERN.search(subject)
    if m:
        return m.group(1)

    # Check To/CC for plus-addressing
    for addr_field in (to_addr, cc_addr):
        m = _PLUS_ADDR_PATTERN.search(addr_field)
        if m:
            return m.group(1)

    # Check body as last resort
    m = _REF_CODE_PATTERN.search(body)
    if m:
        return m.group(1)

    return None


def _extract_email_address(from_header: str) -> Optional[str]:
    """Extract bare email address from a From header."""
    m = re.search(r"<([^>]+)>", from_header)
    if m:
        return m.group(1).strip().lower()
    m = re.search(r"[\w.+-]+@[\w.-]+\.\w+", from_header)
    if m:
        return m.group(0).strip().lower()
    return None


def _extract_body(msg: email.message.Message) -> str:
    """Extract the plain text body from an email message."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            return payload.decode(charset, errors="replace")
    return ""


async def parse_reply_content(raw_body: str) -> Dict[str, Any]:
    """Use Claude to extract structured pricing info from a dealer's reply."""
    try:
        from app.pipeline.utils.claude_client import ask_claude

        prompt = (
            "Extract pricing information from this dealer reply email. "
            "Return a JSON object with these fields:\n"
            '- "price": number or null (the quoted price in dollars)\n'
            '- "lead_time": string or null (e.g., "2-3 weeks")\n'
            '- "availability": string or null (e.g., "in stock", "backordered")\n'
            '- "summary": string (brief 1-2 sentence summary of the reply)\n\n'
            "Reply ONLY with the JSON object, no other text.\n\n"
            f"Email body:\n{raw_body[:3000]}"
        )
        raw = await ask_claude(prompt, max_tokens=500)
        if not raw:
            return _basic_parse(raw_body)

        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1])
        parsed = json.loads(cleaned)

        return {
            "price": parsed.get("price"),
            "lead_time": parsed.get("lead_time"),
            "availability": parsed.get("availability"),
            "summary": parsed.get("summary"),
        }
    except Exception:
        logger.exception("LLM parsing failed, falling back to basic parse")
        return _basic_parse(raw_body)


def _basic_parse(raw_body: str) -> Dict[str, Any]:
    """Fallback basic parsing when LLM is not available."""
    price = None
    price_match = re.search(r"\$\s?([\d,]+\.?\d*)", raw_body)
    if price_match:
        try:
            price = float(price_match.group(1).replace(",", ""))
        except ValueError:
            pass

    return {
        "price": price,
        "lead_time": None,
        "availability": None,
        "summary": raw_body[:200].strip() if raw_body else None,
    }
