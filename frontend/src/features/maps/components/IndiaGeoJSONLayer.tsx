/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef, useCallback } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";

import { useFitBoundsFromLayer } from "../hooks/useMapBounds";
import { useMapFeatureInteractions } from "../hooks/useMapFeatureInteractions";
import { choroplethStyleResolver } from "../utils/choropleth-style";

import type {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";
import type {
  ChoroplethMetricDescriptor,
} from "../types/choropleth";

interface IndiaGeoJSONLayerProps {
  data: GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>;
  metric: ChoroplethMetricDescriptor<IndiaStateGeoJSONProperties>;
  onSelectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
  onDeselectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
}

export function IndiaGeoJSONLayer({
  data,
  metric,
  onSelectFeature,
  onDeselectFeature,
}: IndiaGeoJSONLayerProps) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  // 1. Define our dynamic choropleth style
  const choroplethStyle = useCallback(
    (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => choroplethStyleResolver(feature, metric),
    [metric]
  );

  // 2. Pass it into baseStyle so the interaction hooks know what color to revert to
  const { style, onEachFeature } = useMapFeatureInteractions<IndiaStateGeoJSONProperties>(map, {
    baseStyle: choroplethStyle, // <--- THIS IS THE MAGIC FIX
    hoverStyle: {
      weight: 3,
      color: "#0f766e",
      opacity: 1,
      // No fillColor here, so it inherits the correct shade from baseStyle
    },
    selectedStyle: {
      color: "#ea580c",
      weight: 4,
      opacity: 1,
      // No fillColor here either
    },
    onSelectFeature,
    onDeselectFeature,
    defaultCenter: [22.0, 78.0],
    defaultZoom: 5,
    maxZoom: 10,
    padding: [28, 28],
    duration: 0.4,
  });

  useFitBoundsFromLayer(map, layerRef);

  const styledData = useMemo(() => data, [data]);

  return (
    <GeoJSON
      key={`${metric.key}-${styledData.features?.length || 0}`}
      data={styledData as GeoJsonObject}
      ref={layerRef}
      pane="choroplethPane"
      style={style as any} // 3. Use the style returned by your interaction hook
      onEachFeature={onEachFeature}
    />
  );
}
