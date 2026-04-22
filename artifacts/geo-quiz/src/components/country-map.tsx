import { useEffect, useRef } from "react";
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
      map.fitBounds(bounds.pad(0.6), { animate: true });
    } else {
      map.setView(center, 4, { animate: true });
    }
  }, [map, bounds, center]);
  return null;
}

export function CountryMap({ country, geoJson, neighbors }: CountryMapProps) {
  const feature = geoJson?.features.find(
    (f) =>
      f.properties.ISO_A3 === country.cca3 ||
      f.properties.ADM0_A3 === country.cca3 ||
      f.properties.SOV_A3 === country.cca3
  );

  const bounds = feature ? L.geoJSON(feature).getBounds() : null;

  return (
    <div className="h-[280px] w-full rounded-lg overflow-hidden relative z-0">
      <MapContainer
        center={country.latlng}
        zoom={4}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {feature ? (
          <GeoJSON
            data={feature as any}
            style={{
              color: "hsl(0, 60%, 50%)",
              weight: 2,
              fillColor: "hsl(0, 60%, 50%)",
              fillOpacity: 0.3,
            }}
          />
        ) : (
          <CircleMarker
            center={country.latlng}
            radius={20}
            pathOptions={{ color: "hsl(0, 60%, 50%)", fillColor: "hsl(0, 60%, 50%)", fillOpacity: 0.3 }}
          />
        )}
        
        {neighbors.map((neighbor) => {
          return (
            <Marker
              key={neighbor.cca3}
              position={neighbor.latlng}
              icon={L.divIcon({
                className: "bg-transparent font-sans text-xs font-semibold text-slate-700 whitespace-nowrap text-center text-shadow-white",
                html: `<div>${neighbor.nameRu}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10],
              })}
            />
          );
        })}
        <MapController bounds={bounds} center={country.latlng} />
      </MapContainer>
    </div>
  );
}
