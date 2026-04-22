import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import type { Country, GeoJson } from "../lib/countries";

interface CountryMapProps {
  country: Country;
  geoJson: GeoJson | undefined;
  neighbors: Country[];
}

interface ViewPlan {
  kind: "fit" | "center";
  bounds: L.LatLngBounds | null;
  center: [number, number];
  zoom: number;
}

function MapController({ plan }: { plan: ViewPlan }) {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    try {
      if (plan.kind === "fit" && plan.bounds && plan.bounds.isValid()) {
        map.fitBounds(plan.bounds.pad(0.4), { animate: true, maxZoom: 6 });
      } else {
        map.setView(plan.center, plan.zoom, { animate: true });
      }
    } catch {
      // map may be tearing down
    }
    const t = setTimeout(() => {
      if (cancelled) return;
      try {
        map.invalidateSize();
      } catch {
        // map unmounted before timer fired
      }
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [map, plan]);
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

  // Compute span in degrees to detect tiny / island countries
  const span = bounds && bounds.isValid()
    ? Math.max(
        bounds.getNorth() - bounds.getSouth(),
        bounds.getEast() - bounds.getWest(),
      )
    : 0;

  // Pick a sensible regional zoom based on country size
  // span very small (Malta, Singapore, Bahrain): show wide regional view
  // span small (small islands like Jamaica, Cyprus): show medium regional view
  // otherwise: fitBounds normally
  let plan: ViewPlan;
  if (!bounds || !bounds.isValid()) {
    plan = { kind: "center", bounds: null, center: country.latlng, zoom: 4 };
  } else if (span < 1.5) {
    plan = { kind: "center", bounds, center: country.latlng, zoom: 5 };
  } else if (span < 4) {
    plan = { kind: "center", bounds, center: country.latlng, zoom: 5 };
  } else {
    plan = { kind: "fit", bounds, center: country.latlng, zoom: 4 };
  }

  // For tiny/island countries, also draw a visible marker so it's findable at a wider zoom
  const showLocator = !feature || span < 4;

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

        {feature && (
          <GeoJSON
            data={feature as any}
            style={{
              color: "hsl(0, 72%, 45%)",
              weight: 2.5,
              fillColor: "hsl(0, 78%, 55%)",
              fillOpacity: 0.55,
            }}
          />
        )}

        {showLocator && (
          <>
            <CircleMarker
              center={country.latlng}
              radius={16}
              pathOptions={{
                color: "hsl(0, 72%, 45%)",
                fillColor: "hsl(0, 78%, 55%)",
                fillOpacity: 0.25,
                weight: 0,
              }}
            />
            <CircleMarker
              center={country.latlng}
              radius={6}
              pathOptions={{
                color: "white",
                fillColor: "hsl(0, 78%, 50%)",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          </>
        )}

        <MapController plan={plan} />
      </MapContainer>
    </div>
  );
}
