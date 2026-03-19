from __future__ import annotations

import logging
from typing import Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
_PLACES_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"


async def _geocode_zip(zip_code: str, api_key: str) -> Optional[Dict[str, float]]:
    """Convert a US zip code to lat/lng using Google Geocoding API."""
    params = {"address": zip_code, "key": api_key}
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(_GEOCODE_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results", [])
    if not results:
        logger.warning("Geocoding returned no results for zip %s", zip_code)
        return None

    loc = results[0]["geometry"]["location"]
    return {"lat": loc["lat"], "lng": loc["lng"]}


async def search_google_places(
    product: str,
    brand: str,
    zip_code: str,
    radius_miles: int,
) -> List[Dict[str, str]]:
    """Search Google Places for dealers near a zip code.

    Returns a list of dicts with keys:
        name, address, city, state, zip_code, phone, website, source
    """
    api_key: Optional[str] = settings.GOOGLE_PLACES_API_KEY or None
    if not api_key:
        logger.warning("GOOGLE_PLACES_API_KEY not configured; skipping Google Places search")
        return []

    location = await _geocode_zip(zip_code, api_key)
    if location is None:
        return []

    radius_meters = int(radius_miles * 1609.34)
    query = f'"{brand} dealer" OR "{product} store"'

    params = {
        "query": query,
        "location": f"{location['lat']},{location['lng']}",
        "radius": str(radius_meters),
        "key": api_key,
    }

    dealers: List[Dict[str, str]] = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(_PLACES_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        logger.exception("Google Places API call failed")
        return []

    for place in data.get("results", []):
        formatted = place.get("formatted_address", "")
        parts = [p.strip() for p in formatted.split(",")]

        city = parts[1] if len(parts) > 1 else ""
        state_zip = parts[2].strip().split() if len(parts) > 2 else []
        state = state_zip[0] if state_zip else ""
        place_zip = state_zip[1] if len(state_zip) > 1 else ""

        dealer: Dict[str, str] = {
            "name": place.get("name", ""),
            "address": parts[0] if parts else formatted,
            "city": city,
            "state": state,
            "zip_code": place_zip,
            "phone": "",
            "website": "",
            "source": "google_places",
        }

        # Attempt to get phone/website via Place Details if place_id exists
        place_id = place.get("place_id")
        if place_id:
            try:
                detail_params = {
                    "place_id": place_id,
                    "fields": "formatted_phone_number,website",
                    "key": api_key,
                }
                async with httpx.AsyncClient(timeout=10) as client:
                    detail_resp = await client.get(
                        "https://maps.googleapis.com/maps/api/place/details/json",
                        params=detail_params,
                    )
                    detail_resp.raise_for_status()
                    detail_data = detail_resp.json().get("result", {})
                    dealer["phone"] = detail_data.get("formatted_phone_number", "")
                    dealer["website"] = detail_data.get("website", "")
            except Exception:
                logger.debug("Failed to fetch details for place %s", place_id)

        dealers.append(dealer)

    logger.info("Google Places returned %d dealers for '%s' near %s", len(dealers), query, zip_code)
    return dealers
