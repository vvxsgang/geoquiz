import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import type { Country, GeoJson } from "../lib/countries";

interface CountryMapProps {
  country: Country;
  geoJson: GeoJson | undefined;
  neighbors: Country[];
}

function MapController({ bounds, center }: { bounds: L.LatLngBounds | null; center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds.pad(0.55), { animate: true, maxZoom: 6 });
    } else {
      map.setView(center, 4, { animate: true });
    }
    setTimeout(() => map.invalidateSize(), 50);
  }, [map, bounds, center]);
  return null;
}

export function CountryMap({ country, geoJson }: CountryMapProps) {
  const feature = geoJson?.features.find(
    (f) =>
      f.properties.ISO_A3 === country.cca3 ||
      f.properties.ADM0_A3 === country.cca3 ||
      f.properties.SOV_A3 === country.cca3,
  );

  const bounds = feature ? L.geoJSON(feature as any).getBounds() : null;

  return (
    <div className="h-[300px] w-full relative z-0 overflow-hidden isolate">
      <MapContainer
        center={country.latlng}
        zoom={4}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        style={{ height: "100%", width: "100%", background: "hsl(195, 40%, 88%)" }}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        {feature ? (
          <GeoJSON
            data={feature as any}
            style={{
              color: "hsl(0, 72%, 45%)",
              weight: 2.5,
              fillColor: "hsl(0, 78%, 55%)",
              fillOpacity: 0.45,
            }}
          />
        ) : (
          <CircleMarker
            center={country.latlng}
            radius={18}
            pathOptions={{
              color: "hsl(0, 72%, 45%)",
              fillColor: "hsl(0, 78%, 55%)",
              fillOpacity: 0.5,
              weight: 2.5,
            }}
          />
        )}

        <MapController bounds={bounds} center={country.latlng} />
      </MapContainer>
    </div>
  );
}
