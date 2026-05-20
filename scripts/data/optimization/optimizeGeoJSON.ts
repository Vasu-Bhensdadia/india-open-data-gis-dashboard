export interface GeoJSONFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: Record<string, unknown> | null;
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

export function optimizeGeoJSONProperties(collection: GeoJSONCollection): GeoJSONCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      properties: {
        pc_name: feature.properties["pc_name"],
        pc_code: feature.properties["pc_code"],
        state_name: feature.properties["state_name"],
      },
    })),
  };
}

export function mergeGeoJSONFragments(collections: GeoJSONCollection[]): GeoJSONCollection {
  return {
    type: "FeatureCollection",
    features: collections.flatMap((collection) => collection.features),
  };
}
