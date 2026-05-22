import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "../utils/hover-style";

export type ChoroplethMetricKey =
  | "winningParty"
  | "turnout"
  | "literacyRate"
  | "population";

export type ChoroplethMetricKind = "numeric" | "categorical";

export interface ChoroplethColorStop {
  value: number;
  color: string;
}

export interface ChoroplethColorScale {
  stops: ChoroplethColorStop[];
  emptyColor: string;
}

export interface ChoroplethBaseMetricDescriptor<TProperties = Record<string, unknown>> {
  key: ChoroplethMetricKey;
  label: string;
  description: string;
  kind: ChoroplethMetricKind;
  formatValue: (value: number | string) => string;
  extractValue: (feature: GeoJSONFeature<TProperties>) => number | string | null;
}

export interface ChoroplethNumericMetricDescriptor<TProperties = Record<string, unknown>>
  extends ChoroplethBaseMetricDescriptor<TProperties> {
  kind: "numeric";
  colorScale: ChoroplethColorScale;
}

export interface ChoroplethCategoricalMetricDescriptor<TProperties = Record<string, unknown>>
  extends ChoroplethBaseMetricDescriptor<TProperties> {
  kind: "categorical";
  categoryColorMap: Record<string, string>;
  defaultCategoryColor: string;
}

export type ChoroplethMetricDescriptor<TProperties = Record<string, unknown>> =
  | ChoroplethNumericMetricDescriptor<TProperties>
  | ChoroplethCategoricalMetricDescriptor<TProperties>;

export interface ChoroplethConfig<TProperties = Record<string, unknown>> {
  metric: ChoroplethMetricDescriptor<TProperties>;
  baseStyle: GeoJSONPathOptions;
  hoverStyle?: GeoJSONPathOptions;
  selectedStyle?: GeoJSONPathOptions;
}
