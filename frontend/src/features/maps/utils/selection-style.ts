import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "./hover-style";
import { mergeGeoJSONFeatureStyles } from "./hover-style";

export const GEOJSON_SELECTED_CLASS_NAME = "geojson-selected";
export const GEOJSON_SELECTABLE_CLASS_NAME = "geojson-selectable";

export const selectedGeoJSONFeatureStyle: GeoJSONPathOptions = {
  color: "#c2410c",
  weight: 4,
  fillColor: "#fb923c",
  fillOpacity: 0.55,
  opacity: 1,
};

export function createGeoJSONFeatureSelectionStyle(
  style: GeoJSONPathOptions,
): GeoJSONPathOptions {
  return {
    ...style,
    className: `${String(style.className ?? "").trim()} ${GEOJSON_SELECTED_CLASS_NAME}`.trim(),
  };
}

export function mergeGeoJSONFeatureSelectionStyles(
  baseStyle: GeoJSONPathOptions,
  selectedStyle: GeoJSONPathOptions,
): GeoJSONPathOptions {
  return mergeGeoJSONFeatureStyles(baseStyle, selectedStyle);
}

const FEATURE_ID_KEYS = [
  "id",
  "feature_id",
  "region_code",
  "state_code",
  "district_code",
  "code",
  "name",
  "state_name",
  "district_name",
  "constituency_name",
] as const;

export function getGeoJSONFeatureIdentifier<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(feature: GeoJSONFeature<TProperties>): string | undefined {
  if (feature.id !== undefined && feature.id !== null) {
    return String(feature.id);
  }

  const properties = feature.properties as Record<string, unknown> | undefined;

  if (properties) {
    for (const key of FEATURE_ID_KEYS) {
      const value = properties[key as keyof typeof properties];
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value);
      }
    }

    try {
      return JSON.stringify(properties);
    } catch {
      return undefined;
    }
  }

  return undefined;
}
