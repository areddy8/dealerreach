from __future__ import annotations

import logging
from typing import Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_YELP_SEARCH_URL = "https://api.yelp.com/v3/businesses/search"
_MAX_RADIUS_METERS = 40000


async def search_yelp(
    product: str,
    brand: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Search Yelp Fusion API for dealers near a zip code.

    Returns a list of dicts with keys:
        name, address, city, state, zip_code, phone, website, source
    """
    api_key: Optional[str] = settings.YELP_API_KEY or None
    if not api_key:
        logger.warning("YELP_API_KEY not configured; skipping Yelp search")
        return []

    radius_meters = min(int(radius_miles * 1609.34), _MAX_RADIUS_METERS)
    term = f'"{brand}" OR "{product}"'

    headers = {"Authorization": f"Bearer {api_key}"}
    params = {
        "term": term,
        "location": zip_code,
        "radius": str(radius_meters),
        "limit": 50,
    }

    dealers: List[Dict[str, str]] = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(_YELP_SEARCH_URL, headers=headers, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        logger.exception("Yelp API call failed")
        return []

    for biz in data.get("businesses", []):
        loc = biz.get("location", {})
        dealer: Dict[str, str] = {
            "name": biz.get("name", ""),
            "address": loc.get("address1", ""),
            "city": loc.get("city", ""),
            "state": loc.get("state", ""),
            "zip_code": loc.get("zip_code", ""),
            "phone": biz.get("display_phone", ""),
            "website": biz.get("url", ""),
            "source": "yelp",
        }
        dealers.append(dealer)

    logger.info("Yelp returned %d dealers for '%s' near %s", len(dealers), term, zip_code)
    return dealers
