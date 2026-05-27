import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type { DashboardAnalyticsSummary } from "../types/analytics.types";
import type { AnalyticsDataSource } from "../types/analytics.types";

export type AnalyticsChartKind = "bar" | "pie" | "trend" | "distribution";

export type AnalyticsChartStatus = "loading" | "ready" | "empty" | "error";

export type AnalyticsChartId =
  | "partySeatBar"
  | "partySharePie"
  | "metricTrend"
  | "metricDistribution";

export type AnalyticsChartDataSourcePreference = AnalyticsDataSource | "auto";

export type AnalyticsChartLayoutMode = "grid" | "stacked";

export interface AnalyticsChartDefinition {
  id: AnalyticsChartId;
  kind: AnalyticsChartKind;
  title: string;
  description: string;
  defaultVisible: boolean;
  backendKey: string;
  metricAware: boolean;
}

export interface AnalyticsChartBaseModel<TKind extends AnalyticsChartKind, TDatum> {
  id: AnalyticsChartId;
  kind: TKind;
  title: string;
  description: string;
  status: AnalyticsChartStatus;
  source: AnalyticsDataSource;
  sourceLabel: string;
  metricKey: ChoroplethMetricKey | null;
  metricLabel: string | null;
  generatedAt: string;
  totalItems: number;
  data: TDatum[];
  emptyMessage: string;
  errorMessage: string | null;
}

export interface AnalyticsBarDatum {
  id: string;
  label: string;
  value: number;
  fill: string;
  percentage: number;
}

export interface AnalyticsPieDatum {
  id: string;
  label: string;
  value: number;
  fill: string;
  percentage: number;
}

export interface AnalyticsTrendDatum {
  id: string;
  label: string;
  value: number;
  sequence: number;
  fill: string;
}

export interface AnalyticsDistributionDatum {
  id: string;
  label: string;
  min: number;
  max: number;
  count: number;
  fill: string;
  percentage: number;
}

export interface AnalyticsBarChartModel
  extends AnalyticsChartBaseModel<"bar", AnalyticsBarDatum> {
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface AnalyticsPieChartModel
  extends AnalyticsChartBaseModel<"pie", AnalyticsPieDatum> {
  centerLabel: string;
}

export interface AnalyticsTrendChartModel
  extends AnalyticsChartBaseModel<"trend", AnalyticsTrendDatum> {
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface AnalyticsDistributionChartModel
  extends AnalyticsChartBaseModel<"distribution", AnalyticsDistributionDatum> {
  xAxisLabel: string;
  yAxisLabel: string;
  binSizeLabel: string;
}

export type AnalyticsChartModel =
  | AnalyticsBarChartModel
  | AnalyticsPieChartModel
  | AnalyticsTrendChartModel
  | AnalyticsDistributionChartModel;

export interface AnalyticsChartTransformInput {
  features: GeoJSONFeature<Record<string, unknown>>[] | null;
  allFeatureCount: number;
  metricsIndex: ElectionMetricsIndex | null;
  isLoading: boolean;
  errorMessage: string | null;
  summary: DashboardAnalyticsSummary | null;
  selectedMetricKey: ChoroplethMetricKey;
  selectedMetricLabel: string | null;
  selectedMetricKind: "categorical" | "numeric" | null;
  selectedMetricDescriptor: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
}

export interface AnalyticsChartSeries<TDatum> {
  id: AnalyticsChartId;
  kind: AnalyticsChartKind;
  data: TDatum[];
}
