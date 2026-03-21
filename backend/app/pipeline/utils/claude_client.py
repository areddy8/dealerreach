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
    api_key = settings.ANTHROPIC_API_KEY or None
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
        text = message.content[0].text if message.content else ""
        logger.warning(
            "Claude response: model=%s stop=%s tokens_in=%d tokens_out=%d text_len=%d",
            message.model,
            message.stop_reason,
            message.usage.input_tokens,
            message.usage.output_tokens,
            len(text),
        )
        return text
    except Exception:
        logger.exception("Claude API call failed")
        return ""
