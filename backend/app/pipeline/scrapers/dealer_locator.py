from __future__ import annotations

import asyncio
import logging
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

_PARSE_SYSTEM = (
    "You are a data extraction assistant. Extract dealer/store listings from "
    "the provided website content. Return ONLY a JSON array of objects with "
    "these keys: name, address, city, state, zip_code, phone, website, email. "
    "Use empty strings for missing fields. No explanation, just the JSON array."
)


async def _scrape_with_playwright(url: str) -> str:
    """Scrape a page using Playwright and return its text content."""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            )
            page = await context.new_page()
            await page.goto(url, wait_until="networkidle", timeout=30000)
            # Wait a bit for any JS-rendered content
            await page.wait_for_timeout(2000)
            content = await page.content()
            # Also grab visible text for Claude parsing
            text = await page.evaluate("() => document.body.innerText")
            return text or ""
        finally:
            await browser.close()


async def scrape_dealer_locator(
    url: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Scrape a dealer locator page using Playwright and parse with Claude.

    Returns a list of dicts with keys:
        name, address, city, state, zip_code, phone, website, source
    """
    if not url:
        return []

    # Scrape the page with Playwright (sync-incompatible, run in thread if needed)
    try:
        text = await _scrape_with_playwright(url)
    except Exception:
        logger.exception("Playwright scrape failed for %s", url)
        return []

    if not text or len(text.strip()) < 50:
        logger.warning("Playwright returned minimal content for %s", url)
        return []

    # Use Claude to parse the text into structured dealer data
    prompt = (
        f"Extract dealer/store listings from this dealer locator page content. "
        f"Focus on dealers near zip code {zip_code} within {radius_miles} miles "
        f"if location info is available.\n\n{text[:8000]}"
    )

    raw = await ask_claude(prompt, system=_PARSE_SYSTEM, max_tokens=2048)
    if not raw:
        logger.warning("Claude parsing returned empty result for %s", url)
        return []

    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        logger.warning("Could not extract dealer list from Claude response for %s", url)
        return []

    dealers: List[Dict[str, str]] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        dealer: Dict[str, str] = {
            "name": str(entry.get("name", "")),
            "address": str(entry.get("address", "")),
            "city": str(entry.get("city", "")),
            "state": str(entry.get("state", "")),
            "zip_code": str(entry.get("zip_code", "")),
            "phone": str(entry.get("phone", "")),
            "website": str(entry.get("website", "")),
            "email": str(entry.get("email", "")),
            "source": "dealer_locator",
        }
        dealers.append(dealer)

    logger.info("Dealer locator scrape returned %d dealers from %s", len(dealers), url)
    return dealers
