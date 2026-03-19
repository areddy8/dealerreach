from __future__ import annotations

import logging
from typing import Dict

from app.pipeline.utils.claude_client import ask_claude

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are a professional email writer. Write concise, friendly, and "
    "professional inquiry emails. No fluff or filler. The email should feel "
    "like it was written by a real person, not a template."
)

_FALLBACK_BODY = (
    "Hi,\n\n"
    "I'm interested in purchasing the {product_name} by {brand}. Could you "
    "please provide me with pricing, current availability, and estimated lead "
    "time?\n\n"
    "Specifications I'm looking at:\n{specs}\n\n"
    "My reference code for this inquiry is {reference_code}. Please include "
    "it in your reply so I can track your response.\n\n"
    "Thank you for your time.\n\n"
    "Best regards,\n{from_name}"
)


async def personalize_email(
    dealer: Dict[str, str],
    product_name: str,
    brand: str,
    specs: str,
    reference_code: str,
    from_name: str,
) -> Dict[str, str]:
    """Generate a personalized outreach email using Claude.

    Returns a dict with keys: subject, body
    Falls back to a template if Claude is unavailable.
    """
    subject = f"Inquiry about {product_name} [{reference_code}]"

    dealer_name = dealer.get("name", "")
    dealer_city = dealer.get("city", "")

    prompt = (
        f"Write a short, professional email body (no subject line) inquiring "
        f"about purchasing a product from a dealer.\n\n"
        f"Dealer name: {dealer_name}\n"
        f"Dealer city: {dealer_city}\n"
        f"Product: {product_name}\n"
        f"Brand: {brand}\n"
        f"Specs: {specs}\n"
        f"Reference code: {reference_code}\n"
        f"My name: {from_name}\n\n"
        f"Ask about: pricing, availability, and lead time.\n"
        f"Include the reference code and ask them to include it in their reply.\n"
        f"Keep it under 150 words. Sign off with just the first name."
    )

    body = await ask_claude(prompt, system=_SYSTEM, max_tokens=512)

    if not body:
        logger.info("Claude unavailable; using fallback template for %s", dealer_name)
        body = _FALLBACK_BODY.format(
            product_name=product_name,
            brand=brand,
            specs=specs,
            reference_code=reference_code,
            from_name=from_name,
        )

    return {"subject": subject, "body": body}
