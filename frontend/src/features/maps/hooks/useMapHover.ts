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
import type { GeoJSONStyleResolver, GeoJSONStyleSource } from "../utils/style-utils";
import { createGeoJSONStyleResolver, getGeoJSONStyleForFeature } from "../utils/style-utils";

export interface MapHoverConfig<TProperties = Record<string, unknown>> {
  baseStyle?: GeoJSONStyleSource<TProperties>;
  hoverStyle?: GeoJSONStyleSource<TProperties>;
  selectedStyle?: GeoJSONStyleSource<TProperties>;
}

export interface MapHoverResult<TProperties = Record<string, unknown>> {
  style: (feature: GeoJSONFeature<TProperties>) => GeoJSONPathOptions;
  baseStyle: GeoJSONStyleResolver<TProperties>;
  hoverStyle: GeoJSONStyleResolver<TProperties>;
  selectedStyle: GeoJSONStyleResolver<TProperties>;
}

export function useMapHover<TProperties extends Record<string, unknown> = Record<string, unknown>>(
  config?: MapHoverConfig<TProperties>,
): MapHoverResult<TProperties> {
  const {
    baseStyle: configBaseStyle,
    hoverStyle: configHoverStyle,
    selectedStyle: configSelectedStyle,
  } = config ?? {};

  const baseStyle = useMemo(
    () =>
      createGeoJSONStyleResolver(
        configBaseStyle,
        mergeGeoJSONFeatureStyles(defaultGeoJSONFeatureStyle, {
          className: GEOJSON_HOVERABLE_CLASS_NAME,
        }),
      ),
    [configBaseStyle],
  );

  const hoverStyle = useMemo(
    () => (feature: GeoJSONFeature<TProperties>) =>
      mergeGeoJSONFeatureStyles(
        mergeGeoJSONFeatureStyles(baseStyle(feature), hoverGeoJSONFeatureStyle),
        getGeoJSONStyleForFeature(configHoverStyle, feature),
      ),
    [baseStyle, configHoverStyle],
  );

  const selectedStyle = useMemo(
    () => (feature: GeoJSONFeature<TProperties>) =>
      createGeoJSONFeatureSelectionStyle(
        mergeGeoJSONFeatureStyles(
          baseStyle(feature),
          getGeoJSONStyleForFeature(configSelectedStyle, feature),
        ),
      ),
    [baseStyle, configSelectedStyle],
  );

  const style = useCallback(
    (feature: GeoJSONFeature<TProperties>): GeoJSONPathOptions => baseStyle(feature),
    [baseStyle],
  );

  return {
    style,
    baseStyle,
    hoverStyle,
    selectedStyle,
  };
}
