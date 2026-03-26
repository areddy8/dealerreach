from __future__ import annotations

import logging
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

_EXTRACT_SYSTEM = (
    "You are a data extraction assistant. Extract ONLY authorized dealers, showrooms, "
    "and retail stores from Google Maps search results. "
    "EXCLUDE: repair services, support companies, installation services, parts suppliers, "
    "maintenance companies, and any business with words like 'repair', 'support', 'service', "
    "'fix', 'maintenance', 'parts', 'technician' in the name. "
    "Return ONLY a JSON array of objects with these keys: "
    "name, address, city, state, zip_code, phone, website. "
    "Use empty strings for missing fields. No explanation, just the JSON array."
)

# Words that indicate a business is a repair/service company, not a dealer
_EXCLUDE_KEYWORDS = [
    "repair", "support", "service", "fix", "maintenance", "parts",
    "technician", "tech", "installation", "installer", "plumber",
    "plumbing", "hvac", "handyman", "restoration", "salvage",
    "junk", "removal", "hauling", "moving", "cleaning",
]


def _is_dealer(name: str) -> bool:
    """Return True if the business name looks like a dealer/retailer, not a repair shop."""
    name_lower = name.lower()
    for keyword in _EXCLUDE_KEYWORDS:
        if keyword in name_lower:
            return False
    return True


async def search_google_places(
    product: str,
    brand: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Search Google Maps for dealers using Playwright (no API key needed).

    Runs multiple search queries to maximize dealer coverage.
    """

    # Build multiple search queries to improve coverage
    queries = []
    if brand:
        queries.append(f"{brand} dealer near {zip_code}")
        queries.append(f"{brand} authorized dealer near {zip_code}")
    queries.append(f"{product} dealer near {zip_code}")
    # Generic fallback based on product category
    product_lower = product.lower()
    if any(w in product_lower for w in ["grill", "bbq", "smoker", "outdoor kitchen"]):
        queries.append(f"BBQ grill store near {zip_code}")
    elif any(w in product_lower for w in ["fireplace", "stove", "hearth", "insert"]):
        queries.append(f"fireplace dealer near {zip_code}")
    elif any(w in product_lower for w in ["hot tub", "spa", "jacuzzi"]):
        queries.append(f"hot tub dealer near {zip_code}")
    elif any(w in product_lower for w in ["refrigerator", "range", "oven", "dishwasher", "appliance", "rangetop"]):
        queries.append(f"luxury appliance dealer near {zip_code}")

    all_dealers: List[Dict[str, str]] = []
    for query in queries[:3]:  # Cap at 3 queries to avoid being too slow
        result = await _scrape_google_maps_query(query, zip_code, radius_miles)
        all_dealers.extend(result)

    logger.info("Google Maps total: %d dealers from %d queries", len(all_dealers), min(len(queries), 3))
    return all_dealers


async def _scrape_google_maps_query(
    query: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Scrape a single Google Maps query."""
    from playwright.async_api import async_playwright

    maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}?hl=en&gl=us"
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
                await page.goto(maps_url, wait_until="domcontentloaded", timeout=45000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    pass
                await page.wait_for_timeout(3000)

                # Handle Google consent/cookie banners
                for selector in [
                    'button:has-text("Accept all")',
                    'button:has-text("Accept")',
                    'button:has-text("I agree")',
                    'button:has-text("Reject all")',
                    'form[action*="consent"] button',
                ]:
                    try:
                        btn = page.locator(selector).first
                        if await btn.is_visible(timeout=2000):
                            await btn.click()
                            await page.wait_for_timeout(2000)
                            break
                    except Exception:
                        pass

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
        f"zip code, phone number, and website for each business listed. "
        f"If the page content is a consent page, error page, or doesn't contain "
        f"business listings, return an empty JSON array: []\n\n"
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
    filtered = 0
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        name = str(entry.get("name", "")).strip()
        if not name:
            continue
        if not _is_dealer(name):
            filtered += 1
            logger.info("Filtered out non-dealer: %s", name)
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

    logger.info("Google Maps: %d dealers for '%s' (%d filtered out)", len(dealers), query, filtered)
    return dealers
