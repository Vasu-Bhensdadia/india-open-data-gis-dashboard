/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";

import { useFitBoundsFromLayer } from "../hooks/useMapBounds";
import { useMapFeatureInteractions } from "../hooks/useMapFeatureInteractions";

import type {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";

interface IndiaGeoJSONLayerProps {
  data: GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>;
  onSelectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
  onDeselectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
}

export function IndiaGeoJSONLayer({
  data,
  onSelectFeature,
  onDeselectFeature,
}: IndiaGeoJSONLayerProps) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  const { style, onEachFeature } = useMapFeatureInteractions<IndiaStateGeoJSONProperties>(map, {
    baseStyle: {
      color: "#2563eb",
      weight: 2,
      fillColor: "#60a5fa",
      fillOpacity: 0.35,
    },
    hoverStyle: {
      weight: 3,
      fillOpacity: 0.6,
    },
    selectedStyle: {
      color: "#ea580c",
      weight: 4,
      fillColor: "#fbbf24",
      fillOpacity: 0.55,
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
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
