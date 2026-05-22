export type GeoJSONPathOptions = Record<string, unknown>;

export const GEOJSON_HOVERABLE_CLASS_NAME = "geojson-hoverable";

export const defaultGeoJSONFeatureStyle: GeoJSONPathOptions = {
  color: "#0f766e",
  weight: 1,
  opacity: 0.9,
  fillColor: "#d9f99d",
  fillOpacity: 0.85,
  lineJoin: "round",
};

export const hoverGeoJSONFeatureStyle: GeoJSONPathOptions = {
  weight: 3,
  opacity: 1,
};

export function mergeGeoJSONFeatureStyles(
  baseStyle: GeoJSONPathOptions,
  overrides: GeoJSONPathOptions,
): GeoJSONPathOptions {
  return {
    ...baseStyle,
    ...overrides,
  };
}
