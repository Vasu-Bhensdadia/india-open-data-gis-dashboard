import { extractGeoJSONMetadataKey } from "@/features/filters/utils/filter-engine";
import { getSelectedFeatureInfo } from "@/features/maps/utils/feature-info";
import type { ChoroplethMetricDescriptor } from "@/features/maps/types/choropleth";
import type { MapRegionMetadata } from "@/features/maps/map.store";
import {
  getElectionMetrics,
  normalizeKey,
  type ElectionMetrics,
  type ElectionMetricsIndex,
} from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

export type DashboardInteractionOrigin =
  | "map"
  | "analytics"
  | "filters"
  | "legend"
  | "chart"
  | "keyboard"
  | "search";

export type DashboardInteractionKind = "hover" | "selection" | "idle";

export interface ConstituencyInteractionContext {
  featureId: string;
  stateName: string;
  constituencyName: string;
  constituencyNumber: string | null;
  metricKey: string | null;
  metricLabel: string | null;
  metricKind: "categorical" | "numeric" | null;
  metricValue: string | null;
  rawMetricValue: string | number | null;
  metrics: ElectionMetrics | null;
}

export interface DashboardInteractionEvent {
  id: string;
  kind: DashboardInteractionKind;
  origin: DashboardInteractionOrigin;
  timestamp: string;
  context: ConstituencyInteractionContext | null;
  title: string;
  detail: string;
}

export interface ConstituencyMapMetadata extends Partial<MapRegionMetadata> {
  featureId: string;
  regionName: string;
  level: "constituency";
  properties: Record<string, unknown>;
}

function resolveMetricValue(
  feature: GeoJSONFeature<Record<string, unknown>>,
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null,
  metricsIndex: ElectionMetricsIndex | null,
): string | number | null {
  const selectedValue = selectedMetric?.extractValue(feature) ?? null;

  if (selectedValue !== null && selectedValue !== undefined) {
    return selectedValue;
  }

  if (!metricsIndex) {
    return null;
  }

  const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
  const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

  if (!metrics) {
    return null;
  }

  switch (selectedMetric?.key) {
    case "winningParty":
      return metrics.winner_party ?? null;
    case "marginPercentage":
      return metrics.winner_margin_percentage ?? null;
    case "totalVotes":
      return metrics.total_votes ?? null;
    case "boundaryOnly":
    default:
      return null;
  }
}

export function createConstituencyMapMetadata(
  feature: GeoJSONFeature<Record<string, unknown>>,
): ConstituencyMapMetadata {
  const { stateName, constituencyName, constituencyNumber } = getSelectedFeatureInfo(feature);
  const featureId = String(feature.id ?? normalizeKey(stateName, constituencyName));

  return {
    featureId,
    regionName: constituencyName,
    regionCode: constituencyNumber ?? undefined,
    level: "constituency",
    properties: {
      stateName,
      constituencyName,
      constituencyNumber,
    },
  };
}

export function createConstituencyInteractionContext(
  feature: GeoJSONFeature<Record<string, unknown>>,
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null,
  metricsIndex: ElectionMetricsIndex | null,
): ConstituencyInteractionContext {
  const { stateName, constituencyName, constituencyNumber } = getSelectedFeatureInfo(feature);
  const featureId = String(feature.id ?? normalizeKey(stateName, constituencyName));
  const metrics = metricsIndex
    ? getElectionMetrics(stateName, constituencyName, metricsIndex)
    : null;
  const rawMetricValue = resolveMetricValue(feature, selectedMetric, metricsIndex);

  return {
    featureId,
    stateName,
    constituencyName,
    constituencyNumber,
    metricKey: selectedMetric?.key ?? null,
    metricLabel: selectedMetric?.label ?? null,
    metricKind: selectedMetric?.kind ?? null,
    metricValue:
      selectedMetric && rawMetricValue !== null && rawMetricValue !== undefined
        ? selectedMetric.formatValue(rawMetricValue)
        : null,
    rawMetricValue,
    metrics,
  };
}

export function createDashboardInteractionEvent(
  kind: DashboardInteractionKind,
  origin: DashboardInteractionOrigin,
  context: ConstituencyInteractionContext | null,
): DashboardInteractionEvent {
  const title =
    kind === "hover"
      ? context
        ? `Hovering ${context.constituencyName}`
        : "Hover a constituency"
      : kind === "selection"
        ? context
          ? `Selected ${context.constituencyName}`
          : "Selection cleared"
        : "No constituency focused";

  const metricDetail =
    context?.metricLabel && context.metricValue !== null
      ? `${context.metricLabel}: ${context.metricValue}`
      : context?.metricLabel
        ? `${context.metricLabel}: -`
        : "Metric context not available";

  const locationDetail = context
    ? `${context.constituencyName}, ${context.stateName}${context.constituencyNumber ? ` - ${context.constituencyNumber}` : ""}`
    : null;

  const detail = context
    ? `${locationDetail} | ${metricDetail}`
    : "Move the pointer over a constituency to update analytics.";

  return {
    id: `${kind}-${context?.featureId ?? "global"}-${Date.now()}`,
    kind,
    origin,
    timestamp: new Date().toISOString(),
    context,
    title,
    detail,
  };
}

