import type { GeoJSONFeature } from "@/types/geojson";

const STATE_NAME_KEYS = [
  "ST_NAME",
  "STATE_NAME",
  "state_name",
  "state",
  "region_name",
  "name",
] as const;

const CONSTITUENCY_NAME_KEYS = [
  "PC_NAME",
  "PCNAME",
  "CONSTITUENCY",
  "constituency_name",
  "constituency",
  "name",
  "region_name",
] as const;

const CONSTITUENCY_NUMBER_KEYS = [
  "PC_NO",
  "PC_CODE",
  "PCNUMBER",
  "constituency_number",
  "constituency_no",
  "constituency_code",
  "constituency",
  "code",
  "id",
] as const;

function resolveProperty(
  properties: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = properties[key];

    if (value !== undefined && value !== null) {
      const text = String(value).trim();

      if (text) {
        return text;
      }
    }
  }

  return undefined;
}

export interface SelectedFeatureInfo {
  stateName: string;
  constituencyName: string;
  constituencyNumber: string | null;
}

export function getSelectedFeatureInfo<TProperties extends Record<string, unknown>>(
  feature: GeoJSONFeature<TProperties>,
): SelectedFeatureInfo {
  const properties = feature.properties ?? ({} as Record<string, unknown>);

  const stateName = resolveProperty(properties, STATE_NAME_KEYS) ?? "Unknown state";

  const constituencyName =
    resolveProperty(properties, CONSTITUENCY_NAME_KEYS) ?? "Unknown constituency";

  const constituencyNumber = resolveProperty(properties, CONSTITUENCY_NUMBER_KEYS) ?? null;

  return {
    stateName,
    constituencyName,
    constituencyNumber,
  };
}
