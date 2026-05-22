/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";

import { useFitBoundsFromLayer } from "../hooks/useMapBounds";
import { useMapFeatureInteractions } from "../hooks/useMapFeatureInteractions";
import {
  createChoroplethStyleResolver,
} from "../utils/choropleth-style";

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

  const choroplethStyleResolver = useMemo(
    () =>
      createChoroplethStyleResolver(metric, {
        color: "#0f766e",
        weight: 1.2,
        opacity: 1,
        fillOpacity: 0.85,
      }),
    [metric],
  );

  const { style, onEachFeature } = useMapFeatureInteractions<IndiaStateGeoJSONProperties>(map, {
    baseStyle: choroplethStyleResolver,
    hoverStyle: {
      weight: 3,
      color: "#0f766e",
      opacity: 1,
    },
    selectedStyle: {
      color: "#ea580c",
      weight: 4,
      opacity: 1,
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
      data={styledData as GeoJsonObject}
      ref={layerRef}
      pane="choroplethPane"
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
