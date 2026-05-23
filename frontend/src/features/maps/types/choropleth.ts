export type ChoroplethMetricKey = "boundaryOnly" | "winningParty" | "marginPercentage" | "totalVotes";
export interface ColorStop {
  value: number;
  color: string;
}

export interface ColorScale {
  emptyColor: string;
  stops: ColorStop[];
}

export interface BaseMetricDescriptor<TProperties> {
  key: ChoroplethMetricKey;
  label: string;
  description: string;
  extractValue: (feature: { properties: TProperties }) => string | number | null;
  formatValue: (value: string | number | null) => string;
}

export interface CategoricalMetricDescriptor<TProperties> extends BaseMetricDescriptor<TProperties> {
  kind: "categorical";
  categoryColorMap: Record<string, string>;
  defaultCategoryColor: string;
}

export interface NumericMetricDescriptor<TProperties> extends BaseMetricDescriptor<TProperties> {
  kind: "numeric";
  colorScale: ColorScale;
}

export type ChoroplethMetricDescriptor<TProperties> =
  | CategoricalMetricDescriptor<TProperties>
  | NumericMetricDescriptor<TProperties>;
