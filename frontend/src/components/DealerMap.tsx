"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { Dealer } from "@/lib/types";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
];

const containerStyle = { width: "100%", height: "400px" };

interface DealerCoord {
  dealer: Dealer;
  lat: number;
  lng: number;
}

interface DealerMapProps {
  dealers: Dealer[];
  zipCode: string;
}

export default function DealerMap({ dealers, zipCode }: DealerMapProps) {
  const [coords, setCoords] = useState<DealerCoord[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8, lng: -98.5 });
  const [selectedDealer, setSelectedDealer] = useState<DealerCoord | null>(null);
  const [loading, setLoading] = useState(true);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    // Geocode the zip code for center
    geocoderRef.current.geocode({ address: `${zipCode}, USA` }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setCenter({ lat: loc.lat(), lng: loc.lng() });
        map.setCenter(loc);
        map.setZoom(10);
      }
    });

    // Geocode all dealers
    const dealerCoords: DealerCoord[] = [];
    let completed = 0;

    dealers.forEach((dealer, i) => {
      const address = [dealer.address, dealer.city, dealer.state, dealer.zip_code]
        .filter(Boolean)
        .join(", ");
      if (!address || address.length < 5) {
        completed++;
        if (completed === dealers.length) {
          setCoords(dealerCoords);
          setLoading(false);
          fitBounds(map, dealerCoords);
        }
        return;
      }

      // Stagger requests slightly to avoid rate limiting
      setTimeout(() => {
        geocoderRef.current?.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            dealerCoords.push({
              dealer,
              lat: loc.lat(),
              lng: loc.lng(),
            });
          }
          completed++;
          // Update markers progressively
          setCoords([...dealerCoords]);
          if (completed === dealers.length) {
            setLoading(false);
            fitBounds(map, dealerCoords);
          }
        });
      }, i * 200); // 200ms between requests
    });
  }, [dealers, zipCode]);

  function fitBounds(map: google.maps.Map, dealerCoords: DealerCoord[]) {
    if (dealerCoords.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    dealerCoords.forEach((dc) => bounds.extend({ lat: dc.lat, lng: dc.lng }));
    // Also include the center (user location)
    bounds.extend(center);
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }

  if (dealers.length === 0) return null;

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 mb-6 text-center text-sm text-slate-500">
        Map unavailable — Google Maps API key not configured.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Dealer Map</h2>
        {loading && (
          <span className="text-xs text-slate-500 flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-blue-500" />
            Plotting {coords.length}/{dealers.length} dealers...
          </span>
        )}
      </div>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onMapLoad}
          options={{
            styles: MAP_STYLES,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* User location marker */}
          <Marker
            position={center}
            icon={{
              path: 0, // google.maps.SymbolPath.CIRCLE
              scale: 10,
              fillColor: "#10B981",
              fillOpacity: 0.9,
              strokeColor: "#059669",
              strokeWeight: 2,
            }}
            title="Your location"
          />

          {/* Dealer markers */}
          {coords.map((dc) => (
            <Marker
              key={dc.dealer.id}
              position={{ lat: dc.lat, lng: dc.lng }}
              onClick={() => setSelectedDealer(dc)}
              icon={{
                path: 0, // google.maps.SymbolPath.CIRCLE
                scale: 9,
                fillColor: "#3B82F6",
                fillOpacity: 0.9,
                strokeColor: "#1E40AF",
                strokeWeight: 2,
              }}
              title={dc.dealer.name}
            />
          ))}

          {/* Info window */}
          {selectedDealer && (
            <InfoWindow
              position={{ lat: selectedDealer.lat, lng: selectedDealer.lng }}
              onCloseClick={() => setSelectedDealer(null)}
            >
              <div style={{ color: "#1e293b", maxWidth: 240, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {selectedDealer.dealer.name}
                </div>
                {selectedDealer.dealer.address && (
                  <div>{selectedDealer.dealer.address}</div>
                )}
                <div>
                  {selectedDealer.dealer.city}
                  {selectedDealer.dealer.state ? `, ${selectedDealer.dealer.state}` : ""}
                  {selectedDealer.dealer.zip_code ? ` ${selectedDealer.dealer.zip_code}` : ""}
                </div>
                {selectedDealer.dealer.phone && (
                  <div style={{ marginTop: 4 }}>
                    <a href={`tel:${selectedDealer.dealer.phone}`} style={{ color: "#3B82F6" }}>
                      {selectedDealer.dealer.phone}
                    </a>
                  </div>
                )}
                {selectedDealer.dealer.website && (
                  <div style={{ marginTop: 2 }}>
                    <a
                      href={selectedDealer.dealer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3B82F6" }}
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
