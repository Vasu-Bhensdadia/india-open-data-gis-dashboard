export interface GeometryObject {
  type: string;
  coordinates: unknown;
}

export interface GeoJSONFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: GeometryObject | null;
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

export function simplifyGeometry(feature: GeoJSONFeature, tolerance = 0.001): GeoJSONFeature {
  // TODO: implement geometry simplification using an algorithm like Douglas–Peucker.
  return {
    ...feature,
    geometry: feature.geometry,
  };
}

export function simplifyGeoJSONCollection(collection: GeoJSONCollection, tolerance = 0.001): GeoJSONCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => simplifyGeometry(feature, tolerance)),
  };
}
