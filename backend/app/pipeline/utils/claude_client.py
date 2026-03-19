from __future__ import annotations

import logging
from typing import Optional

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)


async def ask_claude(
    prompt: str,
    system: str = "",
    max_tokens: int = 1024,
) -> str:
    """Send a prompt to Claude and return the text response.

    Returns an empty string if the API key is missing or the call fails.
    """
    api_key: Optional[str] = settings.ANTHROPIC_API_KEY or None
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not configured; skipping Claude call")
        return ""

    try:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        kwargs = {
            "model": "claude-sonnet-4-20250514",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system

        message = await client.messages.create(**kwargs)
        return message.content[0].text
    except Exception:
        logger.exception("Claude API call failed")
        return ""
