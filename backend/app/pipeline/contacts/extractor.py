from __future__ import annotations

import asyncio
import json
import logging
from typing import Dict, List

from app.pipeline.utils.claude_client import ask_claude

logger = logging.getLogger(__name__)

_EXTRACT_SYSTEM = (
    "You are a contact information extraction assistant. From the provided "
    "website content, extract all contact information. Return ONLY a JSON "
    "object with these keys: emails (list of strings), phones (list of strings), "
    "contact_form_urls (list of strings). Use empty lists for missing fields. "
    "No explanation, just the JSON object."
)


async def _scrape_website(url: str) -> str:
    """Scrape a website using Playwright and return visible text."""
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
            await page.wait_for_timeout(1500)

            # Get visible text for Claude parsing
            text = await page.evaluate("() => document.body.innerText")

            # Also extract href="mailto:" and common contact patterns from HTML
            html = await page.content()
            return f"{text}\n\n--- RAW HTML EXCERPT ---\n{html[:4000]}"
        finally:
            await browser.close()


async def _extract_single(
    dealer: Dict[str, str],
    semaphore: asyncio.Semaphore,
) -> Dict[str, str]:
    """Extract contact info for a single dealer."""
    async with semaphore:
        website = dealer.get("website", "")
        if not website:
            return dealer

        updated = dealer.copy()
        try:
            content = await _scrape_website(website)
            if not content:
                return updated

            prompt = (
                f"Extract contact information from this website content for "
                f'"{dealer.get("name", "unknown dealer")}".\n\n{content[:6000]}'
            )
            raw = await ask_claude(prompt, system=_EXTRACT_SYSTEM, max_tokens=512)
            if not raw:
                return updated

            # Parse the JSON response
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

            parsed = json.loads(cleaned)

            # Update dealer with extracted info
            emails = parsed.get("emails", [])
            phones = parsed.get("phones", [])
            contact_forms = parsed.get("contact_form_urls", [])

            if emails and not updated.get("email"):
                updated["email"] = emails[0]
            if emails:
                updated["all_emails"] = emails

            if phones and not updated.get("phone"):
                updated["phone"] = phones[0]
            if phones:
                updated["all_phones"] = phones

            if contact_forms:
                updated["contact_form_url"] = contact_forms[0]
                updated["all_contact_form_urls"] = contact_forms

        except (json.JSONDecodeError, ValueError):
            logger.warning("Failed to parse contact extraction for %s", dealer.get("name", ""))
        except Exception:
            logger.exception("Error extracting contacts for %s", dealer.get("name", ""))

        return updated


async def extract_contacts(dealers: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Extract contact info from dealer websites.

    Processes dealers in parallel (max 3 concurrent) using Playwright + Claude.
    Dealers without a website are returned as-is.
    """
    semaphore = asyncio.Semaphore(3)
    tasks = [_extract_single(dealer, semaphore) for dealer in dealers]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    updated: List[Dict[str, str]] = []
    for i, result in enumerate(results):
        if isinstance(result, BaseException):
            logger.error("Contact extraction failed for dealer %d: %s", i, result)
            updated.append(dealers[i])
        else:
            updated.append(result)  # type: ignore[arg-type]

    logger.info("Extracted contacts for %d dealers", len(updated))
    return updated
