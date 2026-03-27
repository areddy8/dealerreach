from __future__ import annotations

import json
import logging
from typing import Any

from app.pipeline.utils.claude_client import ask_claude

logger = logging.getLogger(__name__)


async def generate_editorial_description(
    product_name: str,
    brand: str,
    category: str,
    specs: dict[str, Any] | None = None,
) -> str:
    """Generate a luxury editorial product description using Claude."""
    specs_text = json.dumps(specs, indent=2) if specs else "N/A"
    prompt = (
        "Write an editorial, luxury-magazine-style product description for this "
        "high-end appliance. Be evocative and aspirational. "
        f"Product: {product_name} by {brand}. "
        f"Category: {category}. "
        f"Specifications: {specs_text}. "
        "Keep it to 2-3 paragraphs."
    )
    return await ask_claude(
        prompt=prompt,
        system="You are a luxury lifestyle magazine editor specializing in high-end home appliances and design.",
        max_tokens=1024,
    )


async def curate_products(
    query: str,
    products_data: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Send product catalog and query to Claude for AI curation.

    Returns a list of dicts with product_id and reasoning.
    """
    if not products_data:
        return []

    products_summary = json.dumps(products_data, indent=2, default=str)
    prompt = (
        f"A dealer has asked: \"{query}\"\n\n"
        f"Here is their product catalog:\n{products_summary}\n\n"
        "Based on the query, recommend the best matching products. "
        "Return a JSON array of objects with 'product_id' and 'reasoning' fields. "
        "Only return the JSON array, no other text."
    )
    response = await ask_claude(
        prompt=prompt,
        system="You are a luxury product curation assistant. Return only valid JSON.",
        max_tokens=2048,
    )

    if not response:
        return []

    try:
        # Try to parse the JSON response, stripping markdown fences if present
        text = response.strip()
        if text.startswith("```"):
            # Remove markdown code fences
            lines = text.split("\n")
            lines = [line for line in lines if not line.strip().startswith("```")]
            text = "\n".join(lines)
        result = json.loads(text)
        if isinstance(result, list):
            return result
        return []
    except (json.JSONDecodeError, TypeError):
        logger.warning("Failed to parse Claude curation response: %s", response[:200])
        return []
