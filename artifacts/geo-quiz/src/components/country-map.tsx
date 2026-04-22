import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, CircleMarker } from "react-leaflet";
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

function makeLabel(text: string, variant: "primary" | "neighbor") {
  const cls =
    variant === "primary"
      ? "geo-label geo-label-primary"
      : "geo-label geo-label-neighbor";
  return L.divIcon({
    className: "",
    html: `<div class="${cls}">${text}</div>`,
    iconSize: [120, 20],
    iconAnchor: [60, 10],
  });
}

export function CountryMap({ country, geoJson, neighbors }: CountryMapProps) {
  const feature = geoJson?.features.find(
    (f) =>
      f.properties.ISO_A3 === country.cca3 ||
      f.properties.ADM0_A3 === country.cca3 ||
      f.properties.SOV_A3 === country.cca3,
  );

  const bounds = feature ? L.geoJSON(feature as any).getBounds() : null;
  const labelCenter: [number, number] = bounds && bounds.isValid()
    ? [bounds.getCenter().lat, bounds.getCenter().lng]
    : country.latlng;

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
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
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

        <Marker position={labelCenter} icon={makeLabel(country.nameRu, "primary")} interactive={false} />

        {neighbors.map((neighbor) => (
          <Marker
            key={neighbor.cca3}
            position={neighbor.latlng}
            icon={makeLabel(neighbor.nameRu, "neighbor")}
            interactive={false}
          />
        ))}

        <MapController bounds={bounds} center={country.latlng} />
      </MapContainer>
    </div>
  );
}
