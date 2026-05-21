import { useCallback } from "react";

import { getLayerBounds } from "../utils/map-bounds";
import { resetMapView, zoomToBounds } from "../utils/zoom-utils";

export interface MapZoomConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  maxZoom?: number;
  padding?: [number, number];
  duration?: number;
}

export interface MapZoomResult {
  zoomToLayer: (layer: unknown) => void;
  resetMapView: () => void;
}

export function useMapZoom(
  map: unknown,
  config: MapZoomConfig,
): MapZoomResult {
  const {
    defaultCenter,
    defaultZoom,
    maxZoom,
    padding = [24, 24],
    duration = 0.4,
  } = config;

  const zoomToLayer = useCallback(
    (layer: unknown) => {
      const featureBounds = getLayerBounds(layer);
      if (!featureBounds) {
        return;
      }

      zoomToBounds(map, featureBounds, {
        maxZoom,
        padding,
        duration,
        animate: true,
      });
    },
    [duration, map, maxZoom, padding],
  );

  const resetView = useCallback(() => {
    resetMapView(map, defaultCenter, defaultZoom, {
      duration,
      animate: true,
    });
  }, [defaultCenter, defaultZoom, duration, map]);

  return {
    zoomToLayer,
    resetMapView: resetView,
  };
}
