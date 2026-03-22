from __future__ import annotations

import logging
from typing import Dict, List, Optional

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

_PARSE_SYSTEM = (
    "You are a data extraction assistant. Extract dealer/store listings from "
    "the provided website content. Return ONLY a JSON array of objects with "
    "these keys: name, address, city, state, zip_code, phone, website, email. "
    "Use empty strings for missing fields. No explanation, just the JSON array."
)


async def _scrape_dealer_locator_page(url: str, zip_code: str) -> str:
    """Scrape a dealer locator page using Playwright.

    Handles interactive pages by:
    1. Looking for zip/location input fields and filling them
    2. Clicking search/submit buttons
    3. Waiting for results to load
    4. Extracting the page text
    """
    from playwright.async_api import async_playwright

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
            await page.goto(url, wait_until="domcontentloaded", timeout=45000)
            # Wait extra for JS to render
            try:
                await page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass  # Some heavy pages never reach networkidle
            await page.wait_for_timeout(2000)

            # Try to find and fill zip/location input fields
            zip_filled = False
            for selector in [
                'input[placeholder*="zip" i]',
                'input[placeholder*="ZIP" i]',
                'input[placeholder*="postal" i]',
                'input[placeholder*="location" i]',
                'input[placeholder*="city" i]',
                'input[placeholder*="address" i]',
                'input[placeholder*="enter" i]',
                'input[name*="zip" i]',
                'input[name*="postal" i]',
                'input[name*="location" i]',
                'input[id*="zip" i]',
                'input[id*="postal" i]',
                'input[id*="location" i]',
                'input[id*="search" i]',
                'input[aria-label*="zip" i]',
                'input[aria-label*="location" i]',
                'input[type="text"]:near(label:has-text("zip"))',
                'input[type="search"]',
            ]:
                try:
                    el = page.locator(selector).first
                    if await el.is_visible(timeout=1000):
                        await el.clear()
                        await el.fill(zip_code)
                        zip_filled = True
                        logger.info("Filled zip code in: %s", selector)
                        break
                except Exception:
                    continue

            # If we filled a zip, try to submit the form
            if zip_filled:
                submitted = False
                # Try clicking search/submit buttons
                for btn_selector in [
                    'button[type="submit"]',
                    'button:has-text("Search")',
                    'button:has-text("Find")',
                    'button:has-text("Go")',
                    'button:has-text("Submit")',
                    'input[type="submit"]',
                    'a:has-text("Search")',
                    'a:has-text("Find")',
                    '[class*="search"] button',
                    '[class*="submit"]',
                ]:
                    try:
                        btn = page.locator(btn_selector).first
                        if await btn.is_visible(timeout=1000):
                            await btn.click()
                            submitted = True
                            logger.info("Clicked submit: %s", btn_selector)
                            break
                    except Exception:
                        continue

                # If no button found, try pressing Enter in the input
                if not submitted:
                    try:
                        await page.keyboard.press("Enter")
                        submitted = True
                        logger.info("Pressed Enter to submit")
                    except Exception:
                        pass

                # Wait for results to load
                if submitted:
                    await page.wait_for_timeout(4000)
                    # Wait for any network activity to settle
                    try:
                        await page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception:
                        pass

            # Scroll to load lazy content
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(1500)

            # Extract the page text
            text = await page.evaluate("() => document.body.innerText")
            return text or ""
        finally:
            await browser.close()


async def discover_dealer_locator_url(brand: str) -> Optional[str]:
    """Auto-discover a brand's dealer locator URL by searching Google."""
    from playwright.async_api import async_playwright

    if not brand:
        return None

    query = f"{brand} find a dealer store locator"
    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}&hl=en&gl=us"

    logger.info("Discovering dealer locator URL for brand: %s", brand)

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
                    locale="en-US",
                )
                page = await context.new_page()
                await page.goto(search_url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)

                # Handle cookie consent
                for consent_sel in [
                    'button:has-text("Accept all")',
                    'button:has-text("Accept")',
                    'button:has-text("Reject all")',
                ]:
                    try:
                        btn = page.locator(consent_sel).first
                        if await btn.is_visible(timeout=1000):
                            await btn.click()
                            await page.wait_for_timeout(1000)
                            break
                    except Exception:
                        pass

                # Extract search result URLs
                links = await page.evaluate("""() => {
                    const results = [];
                    const anchors = document.querySelectorAll('a[href]');
                    for (const a of anchors) {
                        const href = a.href;
                        const text = (a.innerText || '').toLowerCase();
                        if (href && !href.includes('google.com') &&
                            !href.includes('youtube.com') &&
                            (text.includes('dealer') || text.includes('find') ||
                             text.includes('locator') || text.includes('store') ||
                             text.includes('where to buy') ||
                             href.includes('dealer') || href.includes('find') ||
                             href.includes('locator') || href.includes('where-to-buy') ||
                             href.includes('store-finder'))) {
                            results.push(href);
                        }
                    }
                    return results;
                }""")

                if links:
                    # Prefer URLs from the brand's own domain
                    brand_lower = brand.lower().replace(" ", "").replace("-", "")
                    for link in links:
                        link_lower = link.lower()
                        if brand_lower in link_lower.replace("-", "").replace(".", ""):
                            logger.info("Found dealer locator URL: %s", link)
                            return link

                    # Fallback: first relevant link
                    logger.info("Using first dealer locator result: %s", links[0])
                    return links[0]

            finally:
                await browser.close()

    except Exception:
        logger.exception("Failed to discover dealer locator URL for %s", brand)

    return None


async def scrape_dealer_locator(
    url: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Scrape a dealer locator page using Playwright and parse with Claude.

    Handles interactive pages by filling in zip codes and submitting forms.
    """
    if not url:
        return []

    logger.info("Scraping dealer locator: %s (zip: %s)", url, zip_code)

    try:
        text = await _scrape_dealer_locator_page(url, zip_code)
    except Exception:
        logger.exception("Playwright scrape failed for %s", url)
        return []

    if not text or len(text.strip()) < 50:
        logger.warning("Dealer locator returned minimal content for %s", url)
        return []

    logger.info("Dealer locator scraped %d chars from %s", len(text), url)

    prompt = (
        f"Extract dealer/store listings from this dealer locator page content. "
        f"Focus on dealers near zip code {zip_code} within {radius_miles} miles "
        f"if location info is available.\n\n{text[:10000]}"
    )

    raw = await ask_claude(prompt, system=_PARSE_SYSTEM, max_tokens=4096)
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
            "email": str(entry.get("email", "")),
            "source": "dealer_locator",
        })

    logger.info("Dealer locator scrape returned %d dealers from %s", len(dealers), url)
    return dealers
