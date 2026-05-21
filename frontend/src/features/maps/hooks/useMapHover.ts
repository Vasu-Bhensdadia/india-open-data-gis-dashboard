"use client";

import { useCallback, useMemo } from "react";

import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "../utils/hover-style";
import {
  GEOJSON_HOVERABLE_CLASS_NAME,
  defaultGeoJSONFeatureStyle,
  hoverGeoJSONFeatureStyle,
  mergeGeoJSONFeatureStyles,
} from "../utils/hover-style";
import { createGeoJSONFeatureSelectionStyle } from "../utils/selection-style";

export interface MapHoverConfig {
  baseStyle?: GeoJSONPathOptions;
  hoverStyle?: GeoJSONPathOptions;
  selectedStyle?: GeoJSONPathOptions;
}

export interface MapHoverResult<TProperties = Record<string, unknown>> {
  style: (feature: GeoJSONFeature<TProperties>) => GeoJSONPathOptions;
  baseStyle: GeoJSONPathOptions;
  hoverStyle: GeoJSONPathOptions;
  selectedStyle: GeoJSONPathOptions;
}

export function useMapHover<TProperties = Record<string, unknown>>(
  config?: MapHoverConfig,
): MapHoverResult<TProperties> {
  const { baseStyle: configBaseStyle, hoverStyle: configHoverStyle, selectedStyle: configSelectedStyle } = config ?? {};

  const baseStyle = useMemo(
    () =>
      mergeGeoJSONFeatureStyles(
        mergeGeoJSONFeatureStyles(defaultGeoJSONFeatureStyle, configBaseStyle ?? {}),
        { className: GEOJSON_HOVERABLE_CLASS_NAME },
      ),
    [configBaseStyle],
  );

  const hoverStyle = useMemo(
    () =>
      mergeGeoJSONFeatureStyles(
        mergeGeoJSONFeatureStyles(baseStyle, hoverGeoJSONFeatureStyle),
        configHoverStyle ?? {},
      ),
    [baseStyle, configHoverStyle],
  );

  const selectedStyle = useMemo(
    () =>
      createGeoJSONFeatureSelectionStyle(
        mergeGeoJSONFeatureStyles(baseStyle, configSelectedStyle ?? {}),
      ),
    [baseStyle, configSelectedStyle],
  );

  const style = useCallback(
    (_feature: GeoJSONFeature<TProperties>): GeoJSONPathOptions => baseStyle,
    [baseStyle],
  );

  return {
    style,
    baseStyle,
    hoverStyle,
    selectedStyle,
  };
}
