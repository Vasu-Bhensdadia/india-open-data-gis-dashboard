import type { GeoJSONFeature } from "@/types/geojson";

export type LatLngBoundsTuple = [number, number, number, number];

export function isLatLngBoundsTuple(value: unknown): value is LatLngBoundsTuple {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

export function normalizeBounds(bounds: LatLngBoundsTuple): LatLngBoundsTuple {
  const [lat1, lng1, lat2, lng2] = bounds;
  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLng = Math.min(lng1, lng2);
  const maxLng = Math.max(lng1, lng2);
  return [minLat, minLng, maxLat, maxLng];
}

interface LeafletBounds {
  getSouthWest?: () => { lat: number; lng: number };
  getNorthEast?: () => { lat: number; lng: number };
}

export function getLayerBounds(layer: unknown): LatLngBoundsTuple | null {
  if (!layer || typeof layer !== "object") {
    return null;
  }

  const layerAsAny = layer as Record<string, unknown>;
  const getBounds = layerAsAny.getBounds;

  if (typeof getBounds === "function") {
    const bounds = getBounds.call(layer) as LeafletBounds | null;
    if (!bounds || typeof bounds !== "object") {
      return null;
    }

    const southWest = typeof bounds.getSouthWest === "function" ? bounds.getSouthWest() : null;
    const northEast = typeof bounds.getNorthEast === "function" ? bounds.getNorthEast() : null;

    if (
      southWest &&
      typeof southWest.lat === "number" &&
      typeof southWest.lng === "number" &&
      northEast &&
      typeof northEast.lat === "number" &&
      typeof northEast.lng === "number"
    ) {
      return normalizeBounds([southWest.lat, southWest.lng, northEast.lat, northEast.lng]);
    }
  }

  return null;
}

export function getFeatureBounds<TProperties = Record<string, unknown>>(
  feature: GeoJSONFeature<TProperties>,
): LatLngBoundsTuple | null {
  if (!feature?.geometry) {
    return null;
  }

  const geometry = feature.geometry as unknown as Record<string, unknown>;
  const coordinates = geometry.coordinates;

  if (!Array.isArray(coordinates)) {
    return null;
  }

  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];

  function accumulate(coord: unknown): void {
    if (!Array.isArray(coord)) {
      return;
    }

    if (coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
      // GeoJSON positions are [longitude, latitude].
      const [lng, lat] = coord as [number, number];
      bounds[0] = Math.min(bounds[0], lat);
      bounds[1] = Math.min(bounds[1], lng);
      bounds[2] = Math.max(bounds[2], lat);
      bounds[3] = Math.max(bounds[3], lng);
      return;
    }

    coord.forEach(accumulate);
  }

  accumulate(coordinates);

  if (!Number.isFinite(bounds[0]) || !Number.isFinite(bounds[1])) {
    return null;
  }

  return normalizeBounds(bounds);
}
