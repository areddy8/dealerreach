from __future__ import annotations

import asyncio
import logging

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Email, Mail, ReplyTo, To

from app.config import settings

logger = logging.getLogger(__name__)


def _send_sync(to_email: str, subject: str, body: str, reply_to: str) -> bool:
    """Synchronous SendGrid send (called via asyncio.to_thread)."""
    api_key = settings.SENDGRID_API_KEY
    if not api_key:
        logger.warning("SENDGRID_API_KEY not configured; skipping email send")
        return False

    message = Mail(
        from_email=Email(settings.SENDGRID_FROM_EMAIL),
        to_emails=To(to_email),
        subject=subject,
        plain_text_content=body,
    )
    message.reply_to = ReplyTo(reply_to)

    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        if 200 <= response.status_code < 300:
            logger.info("Email sent to %s (status %d)", to_email, response.status_code)
            return True
        else:
            logger.warning(
                "SendGrid returned status %d for %s", response.status_code, to_email
            )
            return False
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    reply_to: str,
) -> bool:
    """Send an email via SendGrid.

    Args:
        to_email: Recipient email address.
        subject: Email subject line.
        body: Plain text email body.
        reply_to: Reply-to address, typically using plus-addressing
                  e.g. quotes+{reference_code}@dealerreach.io
    """
    return await asyncio.to_thread(_send_sync, to_email, subject, body, reply_to)
