import { useCallback, useMemo, useRef, useState } from "react";

import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "../utils/hover-style";
import { mergeGeoJSONFeatureStyles } from "../utils/hover-style";
import {
  createGeoJSONFeatureSelectionStyle,
  getGeoJSONFeatureIdentifier,
  selectedGeoJSONFeatureStyle,
} from "../utils/selection-style";
import type {
  GeoJSONStyleResolver,
  GeoJSONStyleSource,
} from "../utils/style-utils";
import {
  createGeoJSONStyleResolver,
  getGeoJSONStyleForFeature,
} from "../utils/style-utils";

type SelectableLeafletLayer<TProperties> = {
  _geojsonSelectionBound?: boolean;
  _geojsonSelected?: boolean;
  feature?: GeoJSONFeature<TProperties>;
  setStyle?: (style: GeoJSONPathOptions) => void;
  on?: (events: Record<string, () => void>) => void;
};

export interface MapSelectionConfig<TProperties = Record<string, unknown>> {
  baseStyle?: GeoJSONStyleSource<TProperties>;
  selectedStyle?: GeoJSONStyleSource<TProperties>;
  onSelectFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onDeselectFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  getFeatureId?: (feature: GeoJSONFeature<TProperties>) => string | undefined;
}

export interface MapSelectionResult<TProperties = Record<string, unknown>> {
  style: (feature: GeoJSONFeature<TProperties>) => GeoJSONPathOptions;
  selectFeature: (layer: unknown, feature: GeoJSONFeature<TProperties>) => void;
  clearSelection: () => void;
  selectedFeature: GeoJSONFeature<TProperties> | null;
  selectedFeatureId: string | null;
  selectedStyle: GeoJSONStyleResolver<TProperties>;
}

export function useMapSelection<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  config?: MapSelectionConfig<TProperties>,
): MapSelectionResult<TProperties> {
  const {
    baseStyle: configBaseStyle,
    selectedStyle: configSelectedStyle,
    onSelectFeature,
    onDeselectFeature,
    getFeatureId,
  } = config ?? {};

  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<
    GeoJSONFeature<TProperties> | null
  >(null);
  const selectedLayerRef = useRef<SelectableLeafletLayer<TProperties> | null>(null);
  const selectedFeatureRef = useRef<GeoJSONFeature<TProperties> | null>(null);

  const baseStyle = useMemo(
    () => createGeoJSONStyleResolver(configBaseStyle, {}),
    [configBaseStyle],
  );

  const selectedStyle = useMemo(
    () =>
      (feature: GeoJSONFeature<TProperties>) =>
        mergeGeoJSONFeatureStyles(
          mergeGeoJSONFeatureStyles(baseStyle(feature), selectedGeoJSONFeatureStyle),
          getGeoJSONStyleForFeature(configSelectedStyle, feature),
        ),
    [baseStyle, configSelectedStyle],
  );

  const resolveFeatureId = useCallback(
    (feature: GeoJSONFeature<TProperties>) =>
      getFeatureId?.(feature) ?? getGeoJSONFeatureIdentifier(feature),
    [getFeatureId],
  );

  const clearSelectedLayer = useCallback(() => {
    const selectedLayer = selectedLayerRef.current;

    if (!selectedLayer || typeof selectedLayer.setStyle !== "function") {
      selectedLayerRef.current = null;
      return;
    }

    selectedLayer._geojsonSelected = false;

    if (selectedLayer.feature) {
      selectedLayer.setStyle(baseStyle(selectedLayer.feature));
    } else {
      selectedLayer.setStyle(baseStyle({
        type: "Feature",
        geometry: null,
        properties: {} as TProperties,
      }));
    }

    selectedLayerRef.current = null;
  }, [baseStyle]);

  const clearSelection = useCallback(() => {
    if (selectedFeatureRef.current) {
      onDeselectFeature?.(selectedFeatureRef.current);
      selectedFeatureRef.current = null;
    }

    clearSelectedLayer();
    setSelectedFeature(null);
    setSelectedFeatureId(null);
  }, [clearSelectedLayer, onDeselectFeature]);

  const isSelectedFeature = useCallback(
    (feature: GeoJSONFeature<TProperties>) => {
      if (!selectedFeatureId) {
        return false;
      }

      const featureId = resolveFeatureId(feature);
      return featureId !== undefined && featureId === selectedFeatureId;
    },
    [resolveFeatureId, selectedFeatureId],
  );

  const style = useCallback(
    (feature: GeoJSONFeature<TProperties>) =>
      isSelectedFeature(feature)
        ? createGeoJSONFeatureSelectionStyle(selectedStyle(feature))
        : baseStyle(feature),
    [baseStyle, isSelectedFeature, selectedStyle],
  );

  const selectFeature = useCallback(
    (layer: unknown, feature: GeoJSONFeature<TProperties>) => {
      const hoverableLayer = layer as SelectableLeafletLayer<TProperties>;

      if (!layer || typeof hoverableLayer.setStyle !== "function") {
        return;
      }

      const featureId = resolveFeatureId(feature);
      if (!featureId) {
        return;
      }

      if (
        selectedFeatureId === featureId &&
        selectedLayerRef.current === hoverableLayer
      ) {
        return;
      }

      const previousLayer = selectedLayerRef.current;

      if (previousLayer && typeof previousLayer.setStyle === "function") {
        previousLayer._geojsonSelected = false;
        if (previousLayer.feature) {
          previousLayer.setStyle(baseStyle(previousLayer.feature));
        } else {
          previousLayer.setStyle(baseStyle({
            type: "Feature",
            geometry: null,
            properties: {} as TProperties,
          }));
        }
        if (selectedFeatureRef.current) {
          onDeselectFeature?.(selectedFeatureRef.current);
        }
      }

      hoverableLayer._geojsonSelected = true;
      hoverableLayer.setStyle(
        createGeoJSONFeatureSelectionStyle(selectedStyle(feature)),
      );
      selectedLayerRef.current = hoverableLayer;
      selectedFeatureRef.current = feature;
      setSelectedFeatureId(featureId);
      setSelectedFeature(feature);
      onSelectFeature?.(feature);
    },
    [baseStyle, onDeselectFeature, onSelectFeature, resolveFeatureId, selectedFeatureId, selectedStyle],
  );

  return {
    style,
    selectFeature,
    clearSelection,
    selectedFeature,
    selectedFeatureId,
    selectedStyle,
  };
}
