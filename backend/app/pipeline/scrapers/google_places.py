from __future__ import annotations

import logging
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

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
    """Search Google Maps for dealers using Playwright (no API key needed)."""
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
                await page.goto(maps_url, wait_until="networkidle", timeout=45000)
                await page.wait_for_timeout(3000)

                # Scroll the results feed to load more
                feed = page.locator('div[role="feed"]')
                if await feed.count() > 0:
                    for _ in range(3):
                        await feed.evaluate("el => el.scrollTo(0, el.scrollHeight)")
                        await page.wait_for_timeout(1500)

                # Try to extract structured data from aria-labels first
                listings = await page.evaluate("""() => {
                    const results = [];
                    const links = document.querySelectorAll('a[href*="/maps/place/"]');
                    for (const link of links) {
                        const label = link.getAttribute('aria-label');
                        if (label && label.length > 3) {
                            results.push(label);
                        }
                    }
                    return results;
                }""")

                if listings and len(listings) > 0:
                    text = "Business listings found:\n" + "\n".join(
                        f"- {name}" for name in listings
                    )
                    # Also grab the full page text for addresses/phones
                    page_text = await page.evaluate("() => document.body.innerText")
                    text += "\n\nFull page text:\n" + (page_text or "")
                else:
                    # Fallback: full page text
                    text = await page.evaluate("() => document.body.innerText")

            finally:
                await browser.close()

    except Exception:
        logger.exception("Playwright Google Maps scrape failed for '%s'", query)
        return []

    if not text or len(text.strip()) < 50:
        logger.warning("Google Maps returned minimal content for '%s'", query)
        return []

    logger.info("Google Maps scraped %d chars for '%s'", len(text), query)

    # Use Claude to parse the scraped text
    prompt = (
        f"Extract business/dealer listings from these Google Maps search results. "
        f"The search was for '{query}'. Extract name, full address, city, state, "
        f"zip code, phone number, and website for each business listed.\n\n"
        f"{text[:12000]}"
    )

    raw = await ask_claude(prompt, system=_EXTRACT_SYSTEM, max_tokens=4096)
    if not raw:
        logger.warning("Claude parsing returned empty for Google Maps '%s'", query)
        return []

    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        logger.warning("Could not extract dealer list from Claude response for Google Maps '%s'", query)
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
