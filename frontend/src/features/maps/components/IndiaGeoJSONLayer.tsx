/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";

import { useFitBoundsFromLayer } from "../hooks/useMapBounds";
import type {
  GeoJSONFeatureCollection,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";

interface IndiaGeoJSONLayerProps {
  data: GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>;
}

const indiaStyle = {
  color: "#0f766e",
  weight: 1,
  opacity: 0.9,
  fillColor: "#d9f99d",
  fillOpacity: 0.3,
};

export function IndiaGeoJSONLayer({
  data,
}: IndiaGeoJSONLayerProps) {
  const map = useMap();

  const layerRef = useRef<any>(null);

  useFitBoundsFromLayer(map, layerRef);

  const styledData = useMemo(() => data, [data]);

  return (
    <GeoJSON
      data={styledData as any}
      style={indiaStyle}
      ref={layerRef}
      onEachFeature={(_feature: any, layer: any) => {
        layer.options.fillOpacity = 0.3;
      }}
    />
  );
}
