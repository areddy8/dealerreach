from __future__ import annotations

import logging

from app.pipeline.utils.claude_client import ask_claude
from app.pipeline.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

_FORM_ANALYSIS_SYSTEM = (
    "You are a web form analysis assistant. Analyze the HTML content and find the "
    "contact or quote request form. Return ONLY a JSON array of actions to fill the "
    "form. Each action must have: "
    '"selector" (CSS selector for the input field), '
    '"value" (the value to fill), '
    '"type" ("fill" for text inputs/textareas, "click" for submit buttons). '
    "Only include the form fields and submit button. "
    "If you cannot find a suitable form, return an empty JSON array: []"
)


async def submit_contact_form(
    form_url: str,
    message: str,
    from_name: str,
    from_email: str,
) -> bool:
    """Submit a contact form on a dealer's website using Playwright.

    Uses Claude to identify form fields and map them to the provided data.
    Returns True if submission was successful, False otherwise.
    """
    from playwright.async_api import async_playwright

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                context = await browser.new_context(
                    viewport={"width": 1280, "height": 800},
                    user_agent=(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                )
                page = await context.new_page()

                # Navigate to the form URL
                await page.goto(form_url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)

                # Get page content for Claude to analyze
                page_content = await page.content()

                # Ask Claude to generate form-filling instructions
                prompt = (
                    f"Analyze this HTML page and find the contact/quote request form.\n"
                    f"I need to fill it with:\n"
                    f"- Name: {from_name}\n"
                    f"- Email: {from_email}\n"
                    f"- Message: {message}\n\n"
                    f"Return a JSON array of actions to fill the form. Each action should have:\n"
                    f'- "selector": CSS selector for the input field\n'
                    f'- "value": the value to fill\n'
                    f'- "type": "fill" for text inputs, "click" for buttons/submit\n\n'
                    f"Only include the form fields and submit button. "
                    f"If you can't find a form, return an empty array.\n\n"
                    f"HTML content (first 15000 chars):\n{page_content[:15000]}"
                )

                raw = await ask_claude(prompt, system=_FORM_ANALYSIS_SYSTEM, max_tokens=1000)
                if not raw:
                    logger.warning("Claude returned empty response for form analysis on %s", form_url)
                    return False

                actions = extract_json(raw)

                if not actions or not isinstance(actions, list) or len(actions) == 0:
                    logger.info("No form fields identified on %s", form_url)
                    return False

                # Execute the form-filling actions
                for action in actions:
                    selector = action.get("selector", "")
                    value = action.get("value", "")
                    action_type = action.get("type", "fill")

                    try:
                        if action_type == "fill":
                            await page.fill(selector, value, timeout=5000)
                        elif action_type == "click":
                            await page.click(selector, timeout=5000)
                            # Wait for navigation/response after submit
                            await page.wait_for_timeout(3000)
                    except Exception as e:
                        logger.warning(
                            "Failed to execute action %s on %s: %s",
                            action_type, selector, e,
                        )
                        continue

                logger.info("Successfully submitted contact form at %s", form_url)
                return True

            finally:
                await browser.close()

    except Exception as e:
        logger.error("Failed to submit contact form at %s: %s", form_url, e)
        return False
