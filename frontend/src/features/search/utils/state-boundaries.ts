import { getFeatureBounds, type LatLngBoundsTuple } from "@/features/maps/utils/map-bounds";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@/types/geojson";

export function normalizeStateKey(stateName: string): string {
  return stateName
    .toUpperCase()
    .replace(/\(SC\)/g, "")
    .replace(/\(ST\)/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

let cachedStateBoundaries: Map<string, LatLngBoundsTuple> | null = null;

export async function loadStateBoundaryIndex(): Promise<Map<string, LatLngBoundsTuple>> {
  if (cachedStateBoundaries) {
    return cachedStateBoundaries;
  }

  try {
    const response = await fetch("/data/state_geojson_for_website.geojson");
    if (!response.ok) {
      throw new Error(`Failed to load state boundaries: ${response.statusText}`);
    }

    const data = (await response.json()) as GeoJSONFeatureCollection<{ ST_NM?: string }>;
    const map = new Map<string, LatLngBoundsTuple>();

    for (const feature of data.features) {
      const stateName = String(feature.properties?.ST_NM ?? "").trim();
      if (!stateName) {
        continue;
      }

      const bounds = getFeatureBounds(feature as GeoJSONFeature<Record<string, unknown>>);
      if (bounds) {
        map.set(normalizeStateKey(stateName), bounds);
      }
    }

    cachedStateBoundaries = map;
    return map;
  } catch (error) {
    console.error("Error loading state boundary index:", error);
    return new Map();
  }
}
