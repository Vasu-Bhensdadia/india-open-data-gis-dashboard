import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "./hover-style";
import { mergeGeoJSONFeatureStyles } from "./hover-style";

export type GeoJSONStyleResolver<TProperties = Record<string, unknown>> = (
  feature: GeoJSONFeature<TProperties>,
) => GeoJSONPathOptions;

export type GeoJSONStyleSource<TProperties = Record<string, unknown>> =
  | GeoJSONPathOptions
  | GeoJSONStyleResolver<TProperties>;

export function createGeoJSONStyleResolver<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  style: GeoJSONStyleSource<TProperties> | undefined,
  defaults: GeoJSONPathOptions,
): GeoJSONStyleResolver<TProperties> {
  if (typeof style === "function") {
    return style;
  }

  return () => mergeGeoJSONFeatureStyles(defaults, style ?? {});
}

export function getGeoJSONStyleForFeature<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  style: GeoJSONStyleSource<TProperties> | undefined,
  feature: GeoJSONFeature<TProperties>,
): GeoJSONPathOptions {
  return typeof style === "function" ? style(feature) : style ?? {};
}
