from __future__ import annotations

import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


def _normalize_name(name: str) -> str:
    """Lowercase and strip punctuation for fuzzy matching."""
    return re.sub(r"[^a-z0-9\s]", "", name.lower()).strip()


def _dedup_key(dealer: Dict[str, str]) -> Tuple[str, str]:
    """Return a (normalized_name, zip_code) tuple for deduplication."""
    return (_normalize_name(dealer.get("name", "")), dealer.get("zip_code", "").strip())


def _completeness_score(dealer: Dict[str, str]) -> int:
    """Score how complete a dealer record is. Higher is better."""
    score = 0
    for key in ("email", "phone", "website", "address", "city", "state"):
        if dealer.get(key):
            score += 1
    # Email is extra valuable
    if dealer.get("email"):
        score += 2
    return score


def merge_dealers(dealer_lists: List[List[Dict[str, str]]]) -> List[Dict[str, str]]:
    """Merge and deduplicate dealers from multiple sources.

    Deduplication key: normalized name + zip_code.
    When merging duplicates, prefer the record with more complete info.
    """
    seen: Dict[Tuple[str, str], Dict[str, str]] = {}

    for dealers in dealer_lists:
        for dealer in dealers:
            key = _dedup_key(dealer)
            if not key[0]:
                # Skip entries with empty name
                continue

            if key not in seen:
                seen[key] = dealer.copy()
            else:
                existing = seen[key]
                # If the new record is more complete, use it as base
                if _completeness_score(dealer) > _completeness_score(existing):
                    merged = dealer.copy()
                    # Fill in any blanks from the existing record
                    for field_key, val in existing.items():
                        if val and not merged.get(field_key):
                            merged[field_key] = val
                    seen[key] = merged
                else:
                    # Fill in blanks in the existing record from the new one
                    for field_key, val in dealer.items():
                        if val and not existing.get(field_key):
                            existing[field_key] = val

    result = list(seen.values())
    logger.info(
        "Merged %d total dealers into %d unique dealers",
        sum(len(dl) for dl in dealer_lists),
        len(result),
    )
    return result
