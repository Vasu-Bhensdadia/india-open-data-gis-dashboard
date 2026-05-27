import type { AnalyticsChartDefinition, AnalyticsChartId } from "./types";

export const ANALYTICS_CHART_DEFINITIONS: Record<AnalyticsChartId, AnalyticsChartDefinition> = {
  partySeatBar: {
    id: "partySeatBar",
    kind: "bar",
    title: "Party seats",
    description: "Winning party seat counts in the current filter scope.",
    defaultVisible: true,
    backendKey: "party_seat_counts",
    metricAware: false,
  },
  partySharePie: {
    id: "partySharePie",
    kind: "pie",
    title: "Party share",
    description: "Seat share breakdown for the leading parties.",
    defaultVisible: true,
    backendKey: "party_share",
    metricAware: false,
  },
  metricTrend: {
    id: "metricTrend",
    kind: "trend",
    title: "Metric trend",
    description: "Ranked distribution for the selected choropleth metric.",
    defaultVisible: true,
    backendKey: "metric_trend",
    metricAware: true,
  },
  metricDistribution: {
    id: "metricDistribution",
    kind: "distribution",
    title: "Metric distribution",
    description: "Histogram-style view of the selected choropleth metric.",
    defaultVisible: true,
    backendKey: "metric_distribution",
    metricAware: true,
  },
};

export const DEFAULT_VISIBLE_ANALYTICS_CHART_IDS: AnalyticsChartId[] = [
  "partySeatBar",
  "partySharePie",
  "metricTrend",
  "metricDistribution",
];

export const DEFAULT_ANALYTICS_CHART_ORDER: AnalyticsChartId[] = [
  "partySeatBar",
  "partySharePie",
  "metricTrend",
  "metricDistribution",
];

export const DEFAULT_ANALYTICS_CHART_LAYOUT = "grid" as const;
export const DEFAULT_ANALYTICS_DATA_SOURCE_PREFERENCE = "auto" as const;
