"""Robust JSON extraction from LLM responses."""
from __future__ import annotations

import json
import re
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def extract_json(text: str) -> Optional[Any]:
    """Extract JSON from an LLM response that may contain markdown fences or extra text.

    Tries multiple strategies:
    1. Direct parse
    2. Strip markdown code fences
    3. Find JSON array/object with regex
    """
    if not text or not text.strip():
        return None

    cleaned = text.strip()

    # Strategy 1: direct parse
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        pass

    # Strategy 2: strip markdown code fences
    # Handle ```json ... ``` or ``` ... ```
    fence_pattern = re.compile(r"```(?:json)?\s*\n?(.*?)\n?\s*```", re.DOTALL)
    match = fence_pattern.search(cleaned)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            pass

    # Strategy 3: find first [ ... ] or { ... } block
    for start_char, end_char in [("[", "]"), ("{", "}")]:
        start_idx = cleaned.find(start_char)
        if start_idx == -1:
            continue
        # Find matching end by counting nesting
        depth = 0
        for i in range(start_idx, len(cleaned)):
            if cleaned[i] == start_char:
                depth += 1
            elif cleaned[i] == end_char:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(cleaned[start_idx : i + 1])
                    except (json.JSONDecodeError, ValueError):
                        break

    logger.debug("Could not extract JSON from: %s", cleaned[:200])
    return None
