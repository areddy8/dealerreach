from __future__ import annotations

import json
import logging
import re
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude

logger = logging.getLogger(__name__)

_EXTRACT_SYSTEM = (
    "You are a data extraction assistant. Extract business listings from Google Maps "
    "search results. Return ONLY a JSON array of objects with these keys: "
    "name, address, city, state, zip_code, phone, website. "
    "Use empty strings for missing fields. No explanation, just the JSON array."
)


async def search_google_places(
    product: str,
    brand: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Search Google Maps for dealers using Playwright (no API key needed).

    Returns a list of dicts with keys:
        name, address, city, state, zip_code, phone, website, source
    """
    from playwright.async_api import async_playwright

    query = f"{brand} dealer near {zip_code}" if brand else f"{product} store near {zip_code}"
    maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"

    logger.info("Scraping Google Maps for '%s'", query)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    viewport={"width": 1280, "height": 900},
                    locale="en-US",
                )
                page = await context.new_page()
                await page.goto(maps_url, wait_until="networkidle", timeout=30000)

                # Wait for results to load
                await page.wait_for_timeout(3000)

                # Scroll the results panel to load more listings
                results_panel = page.locator('div[role="feed"]')
                if await results_panel.count() > 0:
                    for _ in range(3):
                        await results_panel.evaluate(
                            "el => el.scrollTo(0, el.scrollHeight)"
                        )
                        await page.wait_for_timeout(1500)

                # Extract all visible business info via aria labels and text
                text = await page.evaluate("""() => {
                    const results = [];
                    // Each result is an <a> with class 'hfpxzc' or a div with role='article'
                    const items = document.querySelectorAll('div[role="feed"] > div');
                    for (const item of items) {
                        const text = item.innerText;
                        if (text && text.trim().length > 10) {
                            results.push(text.trim());
                        }
                    }
                    return results.join('\\n---SEPARATOR---\\n');
                }""")

                if not text or len(text.strip()) < 20:
                    # Fallback: just grab all visible text
                    text = await page.evaluate("() => document.body.innerText")

            finally:
                await browser.close()

    except Exception:
        logger.exception("Playwright Google Maps scrape failed for '%s'", query)
        return []

    if not text or len(text.strip()) < 50:
        logger.warning("Google Maps returned minimal content for '%s'", query)
        return []

    # Use Claude to parse the scraped text into structured dealer data
    prompt = (
        f"Extract business/dealer listings from these Google Maps search results. "
        f"The search was for '{query}'. Extract name, full address, city, state, "
        f"zip code, phone number, and website for each business listed.\n\n"
        f"{text[:10000]}"
    )

    raw = await ask_claude(prompt, system=_EXTRACT_SYSTEM, max_tokens=4096)
    if not raw:
        logger.warning("Claude parsing returned empty for Google Maps '%s'", query)
        return []

    # Parse JSON response
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        parsed = json.loads(cleaned)
        if not isinstance(parsed, list):
            logger.warning("Claude returned non-list for Google Maps '%s'", query)
            return []
    except (json.JSONDecodeError, ValueError):
        logger.exception("Failed to parse Claude response for Google Maps '%s'", query)
        return []

    dealers: List[Dict[str, str]] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        name = str(entry.get("name", "")).strip()
        if not name:
            continue
        dealers.append({
            "name": name,
            "address": str(entry.get("address", "")),
            "city": str(entry.get("city", "")),
            "state": str(entry.get("state", "")),
            "zip_code": str(entry.get("zip_code", "")),
            "phone": str(entry.get("phone", "")),
            "website": str(entry.get("website", "")),
            "source": "google_maps",
        })

    logger.info("Google Maps scrape returned %d dealers for '%s'", len(dealers), query)
    return dealers
