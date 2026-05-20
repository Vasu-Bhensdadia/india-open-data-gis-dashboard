import fs from "node:fs";

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  license: string;
  source_url: string;
  acquisition_date: string;
  geography: Record<string, unknown>;
  processing: Array<Record<string, unknown>>;
}

export function loadDatasetMetadata(filePath: string): DatasetMetadata | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as DatasetMetadata;
}

export function extractMetadataFromGeoJSON(geojson: Record<string, unknown>): Record<string, unknown> {
  return {
    type: geojson.type,
    featureCount: Array.isArray(geojson.features) ? geojson.features.length : 0,
    properties: Array.isArray(geojson.features) && geojson.features.length > 0
      ? Object.keys((geojson.features[0] as Record<string, unknown>).properties || {})
      : [],
  };
}
