import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type { AnalyticsChartModel } from "../charts/types";
import type {
  DashboardAnalyticsSummary,
  DashboardKpiMetric,
} from "../types/analytics.types";

export type ExportCellValue = string | number | boolean | null;

export type ExportRow = Record<string, ExportCellValue>;

export type DashboardExportDataset =
  | "constituencies"
  | "party-summary"
  | "state-summary";

export type DashboardExportFormat = "csv" | "xlsx";

export interface DashboardExportFiltersSnapshot {
  state: {
    stateCodes: string[];
    stateNames: string[];
    enabled: boolean;
  };
  party: {
    partyNames: string[];
    enabled: boolean;
  };
  voteRange: {
    min: number;
    max: number;
    enabled: boolean;
  };
  turnout: {
    min: number;
    max: number;
    enabled: boolean;
  };
  marginPercentage: {
    min: number;
    max: number;
    enabled: boolean;
  };
  totalVotes: {
    min: number;
    max: number;
    enabled: boolean;
  };
  winnerVotes: {
    min: number;
    max: number;
    enabled: boolean;
  };
}

export interface DashboardExportContext {
  summary: DashboardAnalyticsSummary;
  kpiMetrics: DashboardKpiMetric[];
  filteredFeatures: GeoJSONFeature<Record<string, unknown>>[];
  metricsIndex: ElectionMetricsIndex;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
  selectedMetricKey: ChoroplethMetricKey;
  filtersSnapshot: DashboardExportFiltersSnapshot;
  chartModels: AnalyticsChartModel[];
  totalFeatureCount: number;
  filteredFeatureCount: number;
}

export interface DashboardExportSheet {
  name: string;
  rows: ExportRow[];
}

export interface DashboardExportPayload {
  generatedAt: string;
  constituencies: ExportRow[];
  partySummary: ExportRow[];
  stateSummary: ExportRow[];
  chartSheets: DashboardExportSheet[];
}

export interface DashboardExportResult {
  filename: string;
  format: DashboardExportFormat;
  dataset: DashboardExportDataset;
}
