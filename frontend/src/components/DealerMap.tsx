"use client";

import { useEffect, useRef, useState } from "react";
import type { Dealer } from "@/lib/types";

// Geocode addresses to lat/lng using Nominatim (free, no API key)
async function geocodeAddress(dealer: Dealer): Promise<{ lat: number; lng: number } | null> {
  const query = [dealer.address, dealer.city, dealer.state, dealer.zip_code]
    .filter(Boolean)
    .join(", ");
  if (!query || query.length < 5) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "User-Agent": "DealerReach.io/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // ignore geocoding failures
  }
  return null;
}

interface DealerMapProps {
  dealers: Dealer[];
  zipCode: string;
}

export default function DealerMap({ dealers, zipCode }: DealerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || dealers.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function initMap() {
      // Dynamic import to avoid SSR issues
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      // Clean up existing map
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 28px; height: 28px;
          background: #3B82F6;
          border: 3px solid #1E40AF;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      // Geocode dealers and add markers
      const bounds: [number, number][] = [];

      // First geocode the zip code for centering
      try {
        const centerRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${zipCode}+USA&limit=1`,
          { headers: { "User-Agent": "DealerReach.io/1.0" } }
        );
        const centerData = await centerRes.json();
        if (centerData.length > 0) {
          const center: [number, number] = [parseFloat(centerData[0].lat), parseFloat(centerData[0].lon)];
          bounds.push(center);

          // Add a different marker for the search location
          L.circleMarker(center, {
            radius: 8,
            fillColor: "#10B981",
            color: "#059669",
            weight: 2,
            fillOpacity: 0.8,
          })
            .addTo(map)
            .bindPopup(`<b>Your location</b><br>ZIP: ${zipCode}`);
        }
      } catch {
        // ignore
      }

      // Geocode each dealer (with rate limiting — Nominatim allows 1 req/sec)
      for (let i = 0; i < dealers.length; i++) {
        if (cancelled) return;
        const dealer = dealers[i];
        // Add a small delay between requests
        if (i > 0) await new Promise((r) => setTimeout(r, 1100));

        const coords = await geocodeAddress(dealer);
        if (coords && !cancelled) {
          bounds.push([coords.lat, coords.lng]);
          const popupHtml = `
            <div style="font-size: 13px; max-width: 220px;">
              <b>${dealer.name}</b><br>
              ${dealer.address ? dealer.address + "<br>" : ""}
              ${dealer.city || ""}${dealer.state ? ", " + dealer.state : ""} ${dealer.zip_code || ""}<br>
              ${dealer.phone ? "📞 " + dealer.phone + "<br>" : ""}
              ${dealer.website ? '<a href="' + dealer.website + '" target="_blank" style="color: #3B82F6;">Website</a>' : ""}
            </div>
          `;
          L.marker([coords.lat, coords.lng], { icon })
            .addTo(map)
            .bindPopup(popupHtml);
        }
      }

      // Fit map to bounds
      if (bounds.length > 1) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0] as L.LatLngExpression, 10);
      } else {
        map.setView([39.8, -98.5], 4); // Center of US
      }

      setLoading(false);
    }

    initMap().catch(() => {
      setMapError(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [dealers, zipCode]);

  if (dealers.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Dealer Map</h2>
        {loading && (
          <span className="text-xs text-slate-500 flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-blue-500" />
            Plotting dealers...
          </span>
        )}
      </div>
      {mapError ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Map could not be loaded.
        </div>
      ) : (
        <div ref={mapRef} style={{ height: 400, width: "100%" }} className="bg-slate-800" />
      )}
    </div>
  );
}
