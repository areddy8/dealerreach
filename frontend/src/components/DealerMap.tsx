"use client";

import { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { Dealer } from "@/lib/types";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
const LIBRARIES: ("places")[] = ["places"];

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

const containerStyle = { width: "100%", height: "420px" };

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
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<DealerCoord | null>(null);
  const [loading, setLoading] = useState(true);
  const [plotted, setPlotted] = useState(0);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const geocoder = new google.maps.Geocoder();
    const placesService = new google.maps.places.PlacesService(map);

    // Step 1: Geocode the zip code
    geocoder.geocode({ address: zipCode, region: "us" }, (results, status) => {
      let zipLat = 37.3382;
      let zipLng = -121.8863;
      if (status === "OK" && results && results[0]) {
        zipLat = results[0].geometry.location.lat();
        zipLng = results[0].geometry.location.lng();
      }
      setCenter({ lat: zipLat, lng: zipLng });
      map.setCenter({ lat: zipLat, lng: zipLng });
      map.setZoom(10);

      // Step 2: Find each dealer using Places API text search
      const dealerCoords: DealerCoord[] = [];
      let completed = 0;
      const total = dealers.length;

      if (total === 0) {
        setLoading(false);
        return;
      }

      dealers.forEach((dealer, i) => {
        setTimeout(() => {
          const query = dealer.address && dealer.city
            ? `${dealer.name}, ${dealer.city}, ${dealer.state || ""}`
            : `${dealer.name} near ${zipCode}`;

          const request = {
            query,
            location: new google.maps.LatLng(zipLat, zipLng),
            radius: 80000, // 50 miles in meters
          };

          placesService.textSearch(request, (placeResults, placeStatus) => {
            if (
              placeStatus === google.maps.places.PlacesServiceStatus.OK &&
              placeResults &&
              placeResults[0] &&
              placeResults[0].geometry?.location
            ) {
              const loc = placeResults[0].geometry.location;
              dealerCoords.push({
                dealer,
                lat: loc.lat(),
                lng: loc.lng(),
              });
            }

            completed++;
            setPlotted(completed);
            setCoords([...dealerCoords]);

            if (completed === total) {
              setLoading(false);
              if (dealerCoords.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend({ lat: zipLat, lng: zipLng });
                dealerCoords.forEach((dc) => bounds.extend({ lat: dc.lat, lng: dc.lng }));
                map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
              }
            }
          });
        }, i * 300); // 300ms between to avoid rate limits
      });
    });
  }, [dealers, zipCode]);

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
            Plotting {plotted}/{dealers.length} dealers...
          </span>
        )}
        {!loading && coords.length > 0 && (
          <span className="text-xs text-slate-500">
            {coords.length} of {dealers.length} plotted
          </span>
        )}
      </div>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY} libraries={LIBRARIES}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || { lat: 37.3, lng: -121.9 }}
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
          {/* User location marker (green) */}
          {center && (
            <Marker
              position={center}
              icon={{
                path: 0,
                scale: 10,
                fillColor: "#10B981",
                fillOpacity: 0.9,
                strokeColor: "#059669",
                strokeWeight: 2,
              }}
              title={`Your location (${zipCode})`}
            />
          )}

          {/* Dealer markers (blue) */}
          {coords.map((dc) => (
            <Marker
              key={dc.dealer.id}
              position={{ lat: dc.lat, lng: dc.lng }}
              onClick={() => setSelectedDealer(dc)}
              icon={{
                path: 0,
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
                {(selectedDealer.dealer.city || selectedDealer.dealer.state) && (
                  <div>
                    {selectedDealer.dealer.city}
                    {selectedDealer.dealer.state ? `, ${selectedDealer.dealer.state}` : ""}
                    {selectedDealer.dealer.zip_code ? ` ${selectedDealer.dealer.zip_code}` : ""}
                  </div>
                )}
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
