/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef, useCallback, useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";

import { useFitBoundsFromLayer } from "../hooks/useMapBounds";
import { useMapFeatureInteractions } from "../hooks/useMapFeatureInteractions";
import { choroplethStyleResolver } from "../utils/choropleth-style";
import { normalizeKey } from "@/services/election-metrics.service";

import type {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";
import type { ChoroplethMetricDescriptor } from "../types/choropleth";

interface IndiaGeoJSONLayerProps {
  data: GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>;
  filteredFeatures?: GeoJSONFeature<IndiaStateGeoJSONProperties>[] | null;
  metric: ChoroplethMetricDescriptor<IndiaStateGeoJSONProperties>;
  selectedFeatureId?: string | null;
  selectedFeature?: GeoJSONFeature<IndiaStateGeoJSONProperties> | null;
  onSelectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
  onDeselectFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
  onHoverFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
  onLeaveFeature?: (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => void;
}

export function IndiaGeoJSONLayer({
  data,
  filteredFeatures,
  metric,
  selectedFeatureId,
  selectedFeature,
  onSelectFeature,
  onDeselectFeature,
  onHoverFeature,
  onLeaveFeature,
}: IndiaGeoJSONLayerProps) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  const matchedKeys = useMemo(() => {
    if (!filteredFeatures || !data.features || filteredFeatures.length === data.features.length) {
      return null;
    }
    const keys = new Set<string>();
    for (const f of filteredFeatures) {
      const props = (f.properties || {}) as Record<string, any>;
      const stateName = String(
        props.state_name ?? props.STATE_NAME ?? props.st_name ?? props.ST_NAME ?? "",
      );
      const constName = String(
        props.constituency_name ?? props.CONSTITUENCY_NAME ?? props.pc_name ?? props.PC_NAME ?? "",
      );
      keys.add(normalizeKey(stateName, constName));
    }
    return keys;
  }, [filteredFeatures, data.features]);

  // 1. Define our dynamic choropleth style
  // 1. Define our dynamic choropleth style
  const choroplethStyle = useCallback(
    (feature: GeoJSONFeature<IndiaStateGeoJSONProperties>) => {
      const baseStyle = choroplethStyleResolver(feature, metric);

      if (matchedKeys) {
        const props = (feature.properties || {}) as Record<string, any>;
        const stateName = String(
          props.state_name ?? props.STATE_NAME ?? props.st_name ?? props.ST_NAME ?? "",
        );
        const constName = String(
          props.constituency_name ??
            props.CONSTITUENCY_NAME ??
            props.pc_name ??
            props.PC_NAME ??
            "",
        );

        if (!matchedKeys.has(normalizeKey(stateName, constName))) {
          return { ...baseStyle, fillColor: "#ffffff", fillOpacity: 0 };
        }
      }
      return baseStyle;
    },
    [metric, matchedKeys],
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
    onHoverFeature,
    onLeaveFeature,
    defaultCenter: [22.0, 78.0],
    defaultZoom: 5,
    maxZoom: 10,
    padding: [28, 28],
    duration: 0.4,
    controlledSelectedFeatureId: selectedFeatureId ?? null,
    controlledSelectedFeature: selectedFeature ?? null,
  });

  useEffect(() => {
    if (!layerRef.current) return;

    const geojsonLayer = layerRef.current;
    geojsonLayer.eachLayer((layer: any) => {
      const feature = layer.feature as GeoJSONFeature<IndiaStateGeoJSONProperties>;
      if (!feature) return;

      const props = (feature.properties || {}) as Record<string, any>;
      const constName = String(
        props.constituency_name ?? props.CONSTITUENCY_NAME ?? props.pc_name ?? props.PC_NAME ?? "",
      );
      const stateName = String(
        props.state_name ?? props.STATE_NAME ?? props.st_name ?? props.ST_NAME ?? "",
      );
      const featureId = normalizeKey(stateName, constName);

      const isSelected = selectedFeatureId === featureId || (props.id && String(props.id) === selectedFeatureId);

      layer._geojsonSelected = isSelected;

      const baseStyleObj = choroplethStyle(feature);
      if (isSelected) {
        layer.setStyle({
          ...baseStyleObj,
          color: "#c2410c",
          weight: 4,
          fillColor: "#fb923c",
          fillOpacity: 0.55,
          opacity: 1,
        });
        if (typeof layer.bringToFront === "function") {
          layer.bringToFront();
        }
      } else {
        layer.setStyle(baseStyleObj);
      }
    });
  }, [selectedFeatureId, choroplethStyle]);

  useFitBoundsFromLayer(map, layerRef);

  const styledData = useMemo(() => data, [data]);

  return (
    <GeoJSON
      key={`${metric.key}-${filteredFeatures ? filteredFeatures.length : "all"}`}
      data={styledData as GeoJsonObject}
      ref={layerRef}
      pane="choroplethPane"
      style={style as any} // 3. Use the style returned by your interaction hook
      onEachFeature={onEachFeature}
    />
  );
}
