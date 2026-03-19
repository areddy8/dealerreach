from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


async def submit_contact_form(
    form_url: str,
    message: str,
    from_name: str,
    from_email: str,
) -> bool:
    """Submit a contact form on a dealer's website.

    TODO: Implement Playwright integration to fill and submit web forms.
    This is a placeholder for the MVP -- it logs the intended action and
    returns False to indicate no submission was made.
    """
    logger.info(
        "STUB: Would submit contact form at %s from %s <%s> with message of %d chars",
        form_url,
        from_name,
        from_email,
        len(message),
    )
    return False
