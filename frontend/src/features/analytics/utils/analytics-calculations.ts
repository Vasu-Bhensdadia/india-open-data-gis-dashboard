import type { ChoroplethMetricDescriptor } from "@/features/maps/types/choropleth";
import { extractGeoJSONMetadataKey } from "@/features/filters/utils/filter-engine";
import {
  getElectionMetrics,
  normalizeKey,
  type ElectionMetrics,
} from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type {
  AnalyticsCalculationInput,
  DashboardAnalyticsSummary,
  DashboardKpiMetric,
  PartySeatCount,
  SelectedConstituencyAnalytics,
  SelectedMetricAnalytics,
} from "../types/analytics.types";

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

function formatPercentage(value: number | null, digits = 1): string {
  return value === null ? "-" : `${value.toFixed(digits)}%`;
}

function getFeatureAnalyticsKey(feature: GeoJSONFeature<Record<string, unknown>>): string {
  const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
  return normalizeKey(stateName, constituencyName);
}

function getMetricsForFeature(
  feature: GeoJSONFeature<Record<string, unknown>>,
  metricsIndex: AnalyticsCalculationInput["metricsIndex"],
): ElectionMetrics | null {
  const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
  return getElectionMetrics(stateName, constituencyName, metricsIndex);
}

function sortPartySeatCounts(
  partyCounts: Map<string, number>,
  totalSeats: number,
): PartySeatCount[] {
  return Array.from(partyCounts.entries())
    .map(([partyName, seatCount]) => ({
      partyName,
      seatCount,
      sharePercentage: totalSeats > 0 ? (seatCount / totalSeats) * 100 : 0,
    }))
    .sort((a, b) => b.seatCount - a.seatCount || a.partyName.localeCompare(b.partyName));
}

function formatDescriptorValue(
  metric: ChoroplethMetricDescriptor<Record<string, unknown>>,
  value: string | number | null,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return metric.formatValue(value);
}

function calculateSelectedMetricSummary(
  features: GeoJSONFeature<Record<string, unknown>>[],
  allFeatureCount: number,
  selectedMetric: AnalyticsCalculationInput["selectedMetric"],
): SelectedMetricAnalytics | null {
  if (!selectedMetric) {
    return null;
  }

  if (selectedMetric.key === "boundaryOnly") {
    return {
      key: selectedMetric.key,
      label: selectedMetric.label,
      kind: selectedMetric.kind,
      valueLabel: `${formatInteger(features.length)} / ${formatInteger(allFeatureCount)}`,
      detailLabel: "Constituencies in the current map scope",
      sampleSize: features.length,
    };
  }

  const rawValues = features
    .map((feature) => selectedMetric.extractValue(feature))
    .filter((value): value is string | number => value !== null && value !== undefined);

  if (selectedMetric.kind === "numeric") {
    const values = rawValues
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return {
        key: selectedMetric.key,
        label: selectedMetric.label,
        kind: selectedMetric.kind,
        valueLabel: "-",
        detailLabel: "No metric values in this filter scope",
        sampleSize: 0,
      };
    }

    const sum = values.reduce((total, value) => total + value, 0);
    const average = sum / values.length;
    const aggregateValue = selectedMetric.key === "totalVotes" ? sum : average;
    const aggregateLabel = selectedMetric.key === "totalVotes" ? "sum" : "average";

    return {
      key: selectedMetric.key,
      label: selectedMetric.label,
      kind: selectedMetric.kind,
      valueLabel: selectedMetric.formatValue(aggregateValue),
      detailLabel: `${aggregateLabel} across ${formatInteger(values.length)} constituencies`,
      sampleSize: values.length,
    };
  }

  const counts = new Map<string, number>();
  rawValues.forEach((value) => {
    const label = String(value);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  const [leadingValue, leadingCount] = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0] ?? [null, 0];

  return {
    key: selectedMetric.key,
    label: selectedMetric.label,
    kind: selectedMetric.kind,
    valueLabel: leadingValue ?? "-",
    detailLabel: leadingValue
      ? `${formatInteger(leadingCount)} constituencies with leading category`
      : "No metric values in this filter scope",
    sampleSize: rawValues.length,
  };
}

function calculateSelectedConstituency(
  selectedFeature: AnalyticsCalculationInput["selectedFeature"],
  filteredFeatureKeys: Set<string>,
  metricsIndex: AnalyticsCalculationInput["metricsIndex"],
  selectedMetric: AnalyticsCalculationInput["selectedMetric"],
): SelectedConstituencyAnalytics | null {
  if (!selectedFeature) {
    return null;
  }

  const { stateName, constituencyName } = extractGeoJSONMetadataKey(selectedFeature);
  const featureKey = getFeatureAnalyticsKey(selectedFeature);
  const metrics = getMetricsForFeature(selectedFeature, metricsIndex);
  const selectedMetricRawValue = selectedMetric?.extractValue(selectedFeature) ?? null;

  return {
    id: String(selectedFeature.id ?? featureKey),
    name: constituencyName,
    stateName,
    metrics,
    selectedMetricLabel: selectedMetric?.label ?? null,
    selectedMetricValue: selectedMetric
      ? formatDescriptorValue(selectedMetric, selectedMetricRawValue)
      : null,
    isInFilteredSet: filteredFeatureKeys.has(featureKey),
  };
}

export function calculateAnalyticsSummary(
  input: AnalyticsCalculationInput,
): DashboardAnalyticsSummary {
  const {
    features,
    allFeatureCount,
    metricsIndex,
    selectedFeature,
    selectedMetric,
    source = "client",
  } = input;

  const partyCounts = new Map<string, number>();
  const filteredFeatureKeys = new Set<string>();
  let metricsMatchedCount = 0;
  let totalVotes = 0;
  let marginTotal = 0;
  let marginCount = 0;

  for (const feature of features) {
    filteredFeatureKeys.add(getFeatureAnalyticsKey(feature));

    const metrics = getMetricsForFeature(feature, metricsIndex);
    if (!metrics) {
      continue;
    }

    metricsMatchedCount += 1;
    totalVotes += metrics.total_votes ?? 0;

    if (Number.isFinite(metrics.winner_margin_percentage)) {
      marginTotal += metrics.winner_margin_percentage;
      marginCount += 1;
    }

    if (metrics.winner_party) {
      partyCounts.set(metrics.winner_party, (partyCounts.get(metrics.winner_party) ?? 0) + 1);
    }
  }

  const partySeatCounts = sortPartySeatCounts(partyCounts, metricsMatchedCount);
  const leadingParty = partySeatCounts[0] ?? null;

  return {
    source,
    generatedAt: new Date().toISOString(),
    totalConstituencies: features.length,
    allConstituencies: allFeatureCount,
    filteredOutCount: Math.max(0, allFeatureCount - features.length),
    metricsMatchedCount,
    totalVotes,
    averageWinningMargin: marginCount > 0 ? marginTotal / marginCount : null,
    partySeatCounts,
    leadingParty,
    selectedConstituency: calculateSelectedConstituency(
      selectedFeature,
      filteredFeatureKeys,
      metricsIndex,
      selectedMetric,
    ),
    selectedMetric: calculateSelectedMetricSummary(features, allFeatureCount, selectedMetric),
  };
}

export function buildDashboardKpiMetrics(summary: DashboardAnalyticsSummary): DashboardKpiMetric[] {
  const filterSubvalue =
    summary.filteredOutCount > 0
      ? `${formatInteger(summary.filteredOutCount)} filtered out`
      : "All constituencies included";

  const leadingPartyValue = summary.leadingParty?.partyName ?? "-";
  const leadingPartySubvalue = summary.leadingParty
    ? `${formatInteger(summary.leadingParty.seatCount)} seats (${formatPercentage(summary.leadingParty.sharePercentage)})`
    : "No party data in scope";

  const selected = summary.selectedConstituency;
  const selectedSubvalue = selected?.metrics
    ? `${selected.metrics.winner_party} - margin ${formatPercentage(selected.metrics.winner_margin_percentage)}`
    : selected
      ? "No election metrics found"
      : "Select a constituency on the map";

  return [
    {
      id: "total-constituencies",
      label: "Constituencies",
      value: formatInteger(summary.totalConstituencies),
      subvalue: filterSubvalue,
      description: `${formatInteger(summary.allConstituencies)} total`,
      tone: "blue",
    },
    {
      id: "total-votes",
      label: "Total Votes",
      value: formatCompactNumber(summary.totalVotes),
      subvalue: `${formatInteger(summary.totalVotes)} votes`,
      description: `${formatInteger(summary.metricsMatchedCount)} constituencies with metrics`,
      tone: "emerald",
    },
    {
      id: "average-margin",
      label: "Avg Winning Margin",
      value: formatPercentage(summary.averageWinningMargin),
      subvalue: "Winner over runner-up",
      tone: "amber",
    },
    {
      id: "leading-party",
      label: "Leading Party",
      value: leadingPartyValue,
      subvalue: leadingPartySubvalue,
      tone: "rose",
    },
    {
      id: "selected-metric",
      label: summary.selectedMetric?.label ?? "Selected Metric",
      value: summary.selectedMetric?.valueLabel ?? "-",
      subvalue: summary.selectedMetric?.detailLabel ?? "Metric configuration loading",
      tone: "neutral",
    },
    {
      id: "selected-constituency",
      label: "Selected Constituency",
      value: selected?.name ?? "-",
      description: selected?.stateName,
      subvalue: selected?.isInFilteredSet === false ? "Outside active filters" : selectedSubvalue,
      tone: selected?.isInFilteredSet === false ? "amber" : "neutral",
    },
  ];
}

export function formatPartySeatShare(party: PartySeatCount): string {
  return `${formatInteger(party.seatCount)} seats - ${formatPercentage(party.sharePercentage)}`;
}
