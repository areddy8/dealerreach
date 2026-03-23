from __future__ import annotations

import logging
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

_EXTRACT_SYSTEM = (
    "You are a data extraction assistant. Extract ONLY authorized dealers, showrooms, "
    "and retail stores from Yelp search results. "
    "EXCLUDE: repair services, support companies, installation services, parts suppliers, "
    "maintenance companies, and any business with words like 'repair', 'support', 'service', "
    "'fix', 'maintenance', 'parts', 'technician' in the name. "
    "Return ONLY a JSON array of objects with these keys: "
    "name, address, city, state, zip_code, phone, website. "
    "Use empty strings for missing fields. No explanation, just the JSON array."
)

_EXCLUDE_KEYWORDS = [
    "repair", "support", "service", "fix", "maintenance", "parts",
    "technician", "tech", "installation", "installer", "plumber",
    "plumbing", "hvac", "handyman", "restoration", "salvage",
]


def _is_dealer(name: str) -> bool:
    name_lower = name.lower()
    for keyword in _EXCLUDE_KEYWORDS:
        if keyword in name_lower:
            return False
    return True


async def search_yelp(
    product: str,
    brand: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Search Yelp for dealers using Playwright (no API key needed).

    Returns a list of dicts with keys:
        name, address, city, state, zip_code, phone, website, source
    """
    from playwright.async_api import async_playwright

    query = f"{brand} dealer" if brand else f"{product} store"
    yelp_url = (
        f"https://www.yelp.com/search?"
        f"find_desc={query.replace(' ', '+')}"
        f"&find_loc={zip_code}"
    )

    logger.info("Scraping Yelp for '%s' near %s", query, zip_code)

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
                await page.goto(yelp_url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)

                # Scroll to load more results
                for _ in range(2):
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    await page.wait_for_timeout(1000)

                # Extract visible text from the results
                text = await page.evaluate("() => document.body.innerText")

            finally:
                await browser.close()

    except Exception:
        logger.exception("Playwright Yelp scrape failed for '%s'", query)
        return []

    if not text or len(text.strip()) < 50:
        logger.warning("Yelp returned minimal content for '%s'", query)
        return []

    # Use Claude to parse the scraped text into structured dealer data
    prompt = (
        f"Extract business/dealer listings from these Yelp search results. "
        f"The search was for '{query}' near zip code {zip_code}. "
        f"Extract name, address, city, state, zip code, phone, and website "
        f"for each business listed.\n\n{text[:10000]}"
    )

    raw = await ask_claude(prompt, system=_EXTRACT_SYSTEM, max_tokens=4096)
    if not raw:
        logger.warning("Claude parsing returned empty for Yelp '%s'", query)
        return []

    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        logger.warning("Could not extract dealer list from Claude response for Yelp '%s'", query)
        return []

    dealers: List[Dict[str, str]] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        name = str(entry.get("name", "")).strip()
        if not name or not _is_dealer(name):
            continue
        dealers.append({
            "name": name,
            "address": str(entry.get("address", "")),
            "city": str(entry.get("city", "")),
            "state": str(entry.get("state", "")),
            "zip_code": str(entry.get("zip_code", "")),
            "phone": str(entry.get("phone", "")),
            "website": str(entry.get("website", "")),
            "source": "yelp",
        })

    logger.info("Yelp scrape returned %d dealers for '%s'", len(dealers), query)
    return dealers
