import type {
  ChoroplethMetricDescriptor,
  ChoroplethMetricKey,
} from "@/features/maps/types/choropleth";
import type { ElectionMetrics, ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

export type AnalyticsDataSource = "client" | "backend";

export type AnalyticsTone = "neutral" | "blue" | "emerald" | "amber" | "rose";

export interface PartySeatCount {
  partyName: string;
  seatCount: number;
  sharePercentage: number;
}

export interface SelectedConstituencyAnalytics {
  id: string;
  name: string;
  stateName: string;
  metrics: ElectionMetrics | null;
  selectedMetricLabel: string | null;
  selectedMetricValue: string | null;
  isInFilteredSet: boolean;
}

export interface SelectedMetricAnalytics {
  key: ChoroplethMetricKey;
  label: string;
  kind: ChoroplethMetricDescriptor<Record<string, unknown>>["kind"];
  valueLabel: string;
  detailLabel: string;
  sampleSize: number;
}

export interface DashboardAnalyticsSummary {
  source: AnalyticsDataSource;
  generatedAt: string;
  totalConstituencies: number;
  allConstituencies: number;
  filteredOutCount: number;
  metricsMatchedCount: number;
  totalVotes: number;
  averageWinningMargin: number | null;
  partySeatCounts: PartySeatCount[];
  leadingParty: PartySeatCount | null;
  selectedConstituency: SelectedConstituencyAnalytics | null;
  selectedMetric: SelectedMetricAnalytics | null;
}

export interface DashboardKpiMetric {
  id: string;
  label: string;
  value: string;
  description?: string;
  subvalue?: string;
  tone?: AnalyticsTone;
}

export interface AnalyticsCalculationInput {
  features: GeoJSONFeature<Record<string, unknown>>[];
  allFeatureCount: number;
  metricsIndex: ElectionMetricsIndex;
  selectedFeature: GeoJSONFeature<Record<string, unknown>> | null;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
  selectedMetricKey: ChoroplethMetricKey;
  source?: AnalyticsDataSource;
}

export interface AnalyticsProvider {
  source: AnalyticsDataSource;
  calculateSummary: (input: AnalyticsCalculationInput) => Promise<DashboardAnalyticsSummary>;
}
