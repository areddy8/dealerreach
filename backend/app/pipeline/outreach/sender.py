from __future__ import annotations

import asyncio
import logging
import time

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Email, Mail, ReplyTo, To

from app.config import settings

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
BACKOFF_MULTIPLIER = 1  # 1s, 3s, 9s (multiplied by 3^attempt)


def _is_transient_error(exc: Exception, status_code: int = 0) -> bool:
    """Return True if the error is transient and worth retrying."""
    # Connection-level errors are always transient
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        return True
    # 5xx server errors are transient; 4xx are not
    if status_code >= 500:
        return True
    if 400 <= status_code < 500:
        return False
    # Unknown exceptions — treat as transient
    return True


def _send_sync(
    to_email: str,
    subject: str,
    body: str,
    reply_to: str,
    html_body: str = None,
) -> bool:
    """Synchronous SendGrid send with retry logic (called via asyncio.to_thread)."""
    api_key = settings.SENDGRID_API_KEY
    if not api_key:
        logger.warning("SENDGRID_API_KEY not configured; skipping email send")
        return False

    if html_body:
        message = Mail(
            from_email=Email(settings.SENDGRID_FROM_EMAIL),
            to_emails=To(to_email),
            subject=subject,
            html_content=html_body,
        )
    else:
        message = Mail(
            from_email=Email(settings.SENDGRID_FROM_EMAIL),
            to_emails=To(to_email),
            subject=subject,
            plain_text_content=body,
        )
    message.reply_to = ReplyTo(reply_to)

    sg = SendGridAPIClient(api_key)

    for attempt in range(MAX_RETRIES):
        try:
            response = sg.send(message)
            if 200 <= response.status_code < 300:
                logger.info("Email sent to %s (status %d)", to_email, response.status_code)
                return True

            # Non-success status — check if retryable
            if not _is_transient_error(Exception(), response.status_code):
                logger.warning(
                    "SendGrid returned non-retryable status %d for %s",
                    response.status_code,
                    to_email,
                )
                return False

            logger.warning(
                "SendGrid returned status %d for %s (attempt %d/%d)",
                response.status_code,
                to_email,
                attempt + 1,
                MAX_RETRIES,
            )

        except Exception as exc:
            if not _is_transient_error(exc):
                logger.exception("Non-retryable error sending email to %s", to_email)
                return False

            logger.warning(
                "Transient error sending email to %s (attempt %d/%d): %s",
                to_email,
                attempt + 1,
                MAX_RETRIES,
                exc,
            )

        # Exponential backoff: 1s, 3s, 9s
        if attempt < MAX_RETRIES - 1:
            delay = BACKOFF_MULTIPLIER * (3 ** attempt)
            logger.info("Retrying email to %s in %ds...", to_email, delay)
            time.sleep(delay)

    logger.error("All %d retry attempts exhausted for email to %s", MAX_RETRIES, to_email)
    return False


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    reply_to: str,
    html_body: str = None,
) -> bool:
    """Send an email via SendGrid.

    Args:
        to_email: Recipient email address.
        subject: Email subject line.
        body: Plain text email body.
        reply_to: Reply-to address, typically using plus-addressing
                  e.g. quotes+{reference_code}@dealerreach.io
        html_body: Optional HTML email body. If provided, sent as
                   html_content instead of plain_text_content.
    """
    return await asyncio.to_thread(_send_sync, to_email, subject, body, reply_to, html_body)
