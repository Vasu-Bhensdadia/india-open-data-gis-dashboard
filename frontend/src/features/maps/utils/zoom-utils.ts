import type { LatLngBoundsTuple } from "./map-bounds";

export interface FitBoundsOptions {
  maxZoom?: number;
  padding?: [number, number];
  duration?: number;
  animate?: boolean;
}

export function buildFitBoundsOptions(options?: FitBoundsOptions): Record<string, unknown> {
  return {
    ...(options?.maxZoom !== undefined ? { maxZoom: options.maxZoom } : {}),
    ...(options?.padding ? { padding: options.padding } : {}),
    ...(options?.duration !== undefined ? { duration: options.duration } : {}),
    ...(options?.animate !== undefined ? { animate: options.animate } : {}),
  };
}

interface LeafletMapInstance {
  fitBounds?: (bounds: [[number, number], [number, number]], options?: Record<string, unknown>) => void;
  setView?: (center: [number, number], zoom: number, options?: Record<string, unknown>) => void;
}

export function zoomToBounds(map: unknown, bounds: LatLngBoundsTuple, options?: FitBoundsOptions): void {
  const leafletMap = map as LeafletMapInstance;

  if (!leafletMap || typeof leafletMap.fitBounds !== "function") {
    return;
  }

  const normalizedBounds: [[number, number], [number, number]] = [
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]],
  ];

  leafletMap.fitBounds(normalizedBounds, buildFitBoundsOptions({
    animate: true,
    ...(options ?? {}),
  }));
}

export function resetMapView(
  map: unknown,
  center: [number, number],
  zoom: number,
  options?: FitBoundsOptions,
): void {
  const leafletMap = map as LeafletMapInstance;

  if (!leafletMap || typeof leafletMap.setView !== "function") {
    return;
  }

  const viewOptions: Record<string, unknown> = {
    ...(options?.animate ? { animate: true } : {}),
    ...(options?.duration !== undefined ? { duration: options.duration } : {}),
  };

  leafletMap.setView(center, zoom, viewOptions);
}
