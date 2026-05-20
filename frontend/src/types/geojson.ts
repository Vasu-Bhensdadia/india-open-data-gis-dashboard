export type GeoJSONGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export interface GeoJSONGeometry {
  type: GeoJSONGeometryType;
  coordinates: unknown;
  bbox?: number[];
  properties?: Record<string, unknown>;
}

export interface GeoJSONFeature<TProperties = Record<string, unknown>> {
  type: "Feature";
  id?: string | number;
  geometry: GeoJSONGeometry | null;
  properties: TProperties;
}

export interface GeoJSONFeatureCollection<TProperties = Record<string, unknown>> {
  type: "FeatureCollection";
  features: GeoJSONFeature<TProperties>[];
  bbox?: number[];
  metadata?: Record<string, unknown>;
}

export interface GeoJSONResourceDescriptor {
  id: string;
  name: string;
  url: string;
}

export interface GeoJSONLoadOptions {
  cacheKey?: string;
  forceReload?: boolean;
  signal?: AbortSignal;
}

export interface IndiaStateGeoJSONProperties {
  state_code: string;
  state_name: string;
  [key: string]: unknown;
}
