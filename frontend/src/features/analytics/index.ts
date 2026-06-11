export type {
  AnalyticsCalculationInput,
  AnalyticsDataSource,
  AnalyticsProvider,
  AnalyticsTone,
  DashboardAnalyticsSummary,
  DashboardKpiMetric,
  PartySeatCount,
  SelectedConstituencyAnalytics,
  SelectedMetricAnalytics,
} from "./types/analytics.types";

export {
  buildDashboardKpiMetrics,
  calculateAnalyticsSummary,
  formatPartySeatShare,
} from "./utils/analytics-calculations";

export { useDashboardAnalytics } from "./hooks/useDashboardAnalytics";
export { useDashboardFeatureSync } from "./hooks/useDashboardFeatureSync";
export { useDashboardInteractionSync } from "./hooks/useDashboardInteractionSync";
export { useAnalyticsStore } from "./analytics.store";
export {
  createConstituencyInteractionContext,
  createConstituencyMapMetadata,
  createDashboardInteractionEvent,
} from "./utils/interaction-events";
export type {
  ConstituencyInteractionContext,
  ConstituencyMapMetadata,
  DashboardInteractionEvent,
  DashboardInteractionKind,
  DashboardInteractionOrigin,
} from "./utils/interaction-events";
export {
  selectActiveAnalyticsChartIds,
  selectAnalyticsChartDefinitions,
  selectAnalyticsDataSourcePreference,
  selectAnalyticsLayoutMode,
  selectSelectedAnalyticsChartId,
  selectVisibleAnalyticsChartDefinitions,
} from "./analytics.store";

export * from "./charts";

export { AnalyticsPanel } from "./components/analytics-panel";
export { ConstituencyProfile } from "./components/constituency-profile";
export { ElectionSummaryCard } from "./components/election-summary-card";
export { DashboardInteractionBanner } from "./components/dashboard-interaction-banner";
export { DashboardKpiCard } from "./components/dashboard-kpi-card";
export { DashboardKpiGrid } from "./components/dashboard-kpi-grid";
export { PartySeatBreakdown } from "./components/party-seat-breakdown";

export {
  buildConstituencyProfile,
  formatConstituencyProfile,
  getPartyColor,
  getPartyTone,
} from "./utils/constituency-profile";
export type {
  ConstituencyProfileData,
  FormattedConstituencyProfile,
} from "./utils/constituency-profile";
