import { useCallback } from "react";

import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "../utils/hover-style";
import { bindGeoJSONFeatureInteractions } from "../utils/hover-events";
import { useMapHover } from "./useMapHover";
import { useMapSelection } from "./useMapSelection";
import { useMapZoom } from "./useMapZoom";

export interface MapFeatureInteractionConfig<TProperties = Record<string, unknown>> {
  baseStyle?: GeoJSONPathOptions;
  hoverStyle?: GeoJSONPathOptions;
  selectedStyle?: GeoJSONPathOptions;
  onSelectFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onDeselectFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onHoverFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onLeaveFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onZoomFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  getFeatureId?: (feature: GeoJSONFeature<TProperties>) => string | undefined;
  defaultCenter: [number, number];
  defaultZoom: number;
  maxZoom?: number;
  padding?: [number, number];
  duration?: number;
}

export interface MapFeatureInteractionResult<TProperties = Record<string, unknown>> {
  style: (feature: GeoJSONFeature<TProperties>) => GeoJSONPathOptions;
  onEachFeature: (feature: GeoJSONFeature<TProperties>, layer: unknown) => void;
  resetMapView: () => void;
}

export function useMapFeatureInteractions<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  map: unknown,
  config: MapFeatureInteractionConfig<TProperties>,
): MapFeatureInteractionResult<TProperties> {
  const {
    baseStyle,
    hoverStyle,
    selectedStyle,
    onSelectFeature,
    onDeselectFeature,
    onHoverFeature,
    onLeaveFeature,
    onZoomFeature,
    getFeatureId,
    defaultCenter,
    defaultZoom,
    maxZoom,
    padding,
    duration,
  } = config;

  const hover = useMapHover<TProperties>({
    baseStyle,
    hoverStyle,
    selectedStyle,
  });

  const {
    selectFeature,
    selectedStyle: selectionSelectedStyle,
    style,
  } = useMapSelection<TProperties>({
    baseStyle,
    selectedStyle,
    onSelectFeature,
    onDeselectFeature,
    getFeatureId,
  });

  const { zoomToLayer, resetMapView } = useMapZoom(map, {
    defaultCenter,
    defaultZoom,
    maxZoom,
    padding,
    duration,
  });

  const onEachFeature = useCallback(
    (feature: GeoJSONFeature<TProperties>, layer: unknown) => {
      bindGeoJSONFeatureInteractions(layer, feature, {
        baseStyle: hover.baseStyle,
        hoverStyle: hover.hoverStyle,
        selectedStyle: selectionSelectedStyle,
        onHoverFeature,
        onLeaveFeature,
        onFeatureClick: (clickedFeature) => {
          selectFeature(layer, clickedFeature);
          zoomToLayer(layer);
          onZoomFeature?.(clickedFeature);
        },
      });
    },
    [hover.baseStyle, hover.hoverStyle, onHoverFeature, onLeaveFeature, onZoomFeature, selectFeature, selectionSelectedStyle, zoomToLayer],
  );

  return {
    style,
    onEachFeature,
    resetMapView,
  };
}
