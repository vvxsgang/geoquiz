import { useQuery } from "@tanstack/react-query";
import { getCapitalRu, getRegionRu, getSubregionRu } from "./translations";

export interface Country {
  name: {
    common: string;
    official: string;
    nativeName: Record<string, { official: string; common: string }>;
  };
  translations: {
    rus: { official: string; common: string };
  };
  capital: string[];
  cca2: string;
  cca3: string;
  flags: { png: string; svg: string; alt: string };
  latlng: [number, number];
  region: string;
  subregion: string;
  borders: string[];
  area?: number;
  population?: number;
  
  // Custom added fields
  nameRu: string;
  capitalRu: string;
  regionRu: string;
  subregionRu: string;
}

export interface GeoJson {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      ADM0_A3: string;
      ISO_A3: string;
      SOV_A3: string;
    };
    geometry: any;
  }>;
}

const COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,capital,cca3,flags,translations,latlng,region,subregion,borders";
const COUNTRIES_FALLBACK_URL = "https://restcountries.com/v3.1/independent?status=true&fields=name,capital,cca3,flags,translations,latlng,region,subregion,borders";
const GEOJSON_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

async function fetchCountries(): Promise<Country[]> {
  let res = await fetch(COUNTRIES_URL);
  if (!res.ok) {
    res = await fetch(COUNTRIES_FALLBACK_URL);
    if (!res.ok) {
      throw new Error("Failed to fetch countries data");
    }
  }
  
  const data: Country[] = await res.json();
  
  return data
    .filter((c) => c.capital?.length > 0 && c.translations?.rus?.common)
    .map((c) => ({
      ...c,
      nameRu: c.translations.rus.common,
      capitalRu: getCapitalRu(c.cca3, c.capital[0]),
      regionRu: getRegionRu(c.region),
      subregionRu: getSubregionRu(c.subregion),
    }))
    .sort((a, b) => a.nameRu.localeCompare(b.nameRu));
}

async function fetchGeoJson(): Promise<GeoJson> {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch GeoJSON data");
  }
  return res.json();
}

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGeoJson() {
  return useQuery({
    queryKey: ["geojson"],
    queryFn: fetchGeoJson,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
