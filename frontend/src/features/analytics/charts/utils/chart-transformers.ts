import { extractGeoJSONMetadataKey } from "@/features/filters/utils/filter-engine";
import { getPartyColor, getElectionMetrics } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type {
  AnalyticsBarChartModel,
  AnalyticsBarDatum,
  AnalyticsChartKind,
  AnalyticsChartModel,
  AnalyticsChartTransformInput,
  AnalyticsDistributionChartModel,
  AnalyticsDistributionDatum,
  AnalyticsPieChartModel,
  AnalyticsPieDatum,
  AnalyticsTrendChartModel,
  AnalyticsTrendDatum,
} from "../types";

const BAR_LIMIT = 6;
const PIE_LIMIT = 5;
const TREND_LIMIT = 12;
const DISTRIBUTION_BIN_LIMIT = 8;

const CHART_PALETTE = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#d97706",
  "#be123c",
  "#0891b2",
  "#4f46e5",
  "#15803d",
];

const integerFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentageFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function truncateLabel(value: string, maxLength = 28): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function resolveSourceLabel(source: AnalyticsChartTransformInput["summary"]): string {
  return source?.source === "backend" ? "Backend" : "Client";
}

function getPaletteFill(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

function getPartyFill(label: string, index: number): string {
  return getPartyColor(label) ?? getPaletteFill(index);
}

function resolveMetricValue(
  feature: GeoJSONFeature<Record<string, unknown>>,
  input: AnalyticsChartTransformInput,
): string | number | null {
  const descriptor = input.selectedMetricDescriptor;
  const extractedValue = descriptor?.extractValue(feature) ?? null;

  if (extractedValue !== null && extractedValue !== undefined) {
    return extractedValue;
  }

  if (!input.metricsIndex) {
    return null;
  }

  const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
  const metrics = getElectionMetrics(stateName, constituencyName, input.metricsIndex);

  if (!metrics) {
    return null;
  }

  switch (input.selectedMetricKey) {
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

interface AnalyticsChartCommonFields<TKind extends AnalyticsChartKind> {
  id: AnalyticsChartModel["id"];
  kind: TKind;
  title: string;
  description: string;
  status: AnalyticsChartModel["status"];
  source: AnalyticsChartModel["source"];
  sourceLabel: string;
  metricKey: AnalyticsChartModel["metricKey"];
  metricLabel: AnalyticsChartModel["metricLabel"];
  generatedAt: string;
  totalItems: number;
  emptyMessage: string;
  errorMessage: string | null;
}

function buildBaseModel<TKind extends AnalyticsChartKind>(
  input: AnalyticsChartTransformInput,
  chartId: AnalyticsChartModel["id"],
  kind: TKind,
  title: string,
  description: string,
  emptyMessage: string,
): AnalyticsChartCommonFields<TKind> {
  const baseTimestamp = input.summary?.generatedAt ?? new Date().toISOString();

  if (input.errorMessage) {
    return {
      id: chartId,
      kind,
      title,
      description,
      status: "error",
      source: input.summary?.source ?? "client",
      sourceLabel: resolveSourceLabel(input.summary),
      metricKey: input.selectedMetricKey,
      metricLabel: input.selectedMetricLabel,
      generatedAt: baseTimestamp,
      totalItems: 0,
      emptyMessage,
      errorMessage: input.errorMessage,
    };
  }

  if (input.isLoading) {
    return {
      id: chartId,
      kind,
      title,
      description,
      status: "loading",
      source: input.summary?.source ?? "client",
      sourceLabel: resolveSourceLabel(input.summary),
      metricKey: input.selectedMetricKey,
      metricLabel: input.selectedMetricLabel,
      generatedAt: baseTimestamp,
      totalItems: 0,
      emptyMessage,
      errorMessage: null,
    };
  }

  return {
    id: chartId,
    kind,
    title,
    description,
    status: "ready",
    source: input.summary?.source ?? "client",
    sourceLabel: resolveSourceLabel(input.summary),
    metricKey: input.selectedMetricKey,
    metricLabel: input.selectedMetricLabel,
    generatedAt: baseTimestamp,
    totalItems: 0,
    emptyMessage,
    errorMessage: null,
  };
}

function createBarDatum(label: string, value: number, index: number, total: number): AnalyticsBarDatum {
  return {
    id: `${label}-${index}`,
    label,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    fill: getPartyFill(label, index),
  };
}

function createPieDatum(label: string, value: number, index: number, total: number): AnalyticsPieDatum {
  return {
    id: `${label}-${index}`,
    label,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    fill: getPartyFill(label, index),
  };
}

function createTrendDatum(label: string, value: number, sequence: number): AnalyticsTrendDatum {
  return {
    id: `${label}-${sequence}`,
    label,
    value,
    sequence,
    fill: getPaletteFill(sequence - 1),
  };
}

function createDistributionDatum(
  label: string,
  min: number,
  max: number,
  count: number,
  total: number,
  index: number,
): AnalyticsDistributionDatum {
  return {
    id: `${label}-${index}`,
    label,
    min,
    max,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    fill: getPaletteFill(index),
  };
}

export function createPartySeatBarChartModel(
  input: AnalyticsChartTransformInput,
): AnalyticsBarChartModel {
  const summary = input.summary;
  const base = buildBaseModel(
    input,
    "partySeatBar",
    "bar",
    "Party seats",
    "Winning party seat counts in the current filter scope.",
    "No party seat data is available for the current filter scope.",
  );

  const sourceItems = summary ? summary.partySeatCounts.slice(0, BAR_LIMIT) : [];
  const totalSeats = sourceItems.reduce((total, party) => total + party.seatCount, 0);
  const data = sourceItems.map((party, index) =>
    createBarDatum(party.partyName, party.seatCount, index, totalSeats),
  );

  return {
    ...base,
    totalItems: summary?.partySeatCounts.length ?? 0,
    data,
    xAxisLabel: "Party",
    yAxisLabel: "Seats",
    status: base.status === "ready" && data.length === 0 ? "empty" : base.status,
    emptyMessage: base.emptyMessage,
  };
}

export function createPartySharePieChartModel(
  input: AnalyticsChartTransformInput,
): AnalyticsPieChartModel {
  const summary = input.summary;
  const base = buildBaseModel(
    input,
    "partySharePie",
    "pie",
    "Party share",
    "Seat share breakdown for the leading parties.",
    "No party share data is available for the current filter scope.",
  );

  const sourceItems = summary ? summary.partySeatCounts : [];
  const totalSeats = sourceItems.reduce((total, party) => total + party.seatCount, 0);
  const topParties = sourceItems.slice(0, PIE_LIMIT);
  const otherSeats = sourceItems
    .slice(PIE_LIMIT)
    .reduce((total, party) => total + party.seatCount, 0);
  const data = [
    ...topParties.map((party, index) => createPieDatum(party.partyName, party.seatCount, index, totalSeats)),
    ...(otherSeats > 0 ? [createPieDatum("Other", otherSeats, topParties.length, totalSeats)] : []),
  ];

  return {
    ...base,
    totalItems: summary?.partySeatCounts.length ?? 0,
    data,
    centerLabel: summary?.leadingParty?.partyName ?? "No data",
    status: base.status === "ready" && data.length === 0 ? "empty" : base.status,
    emptyMessage: base.emptyMessage,
  };
}

function buildMetricObservations(input: AnalyticsChartTransformInput) {
  if (!input.features) {
    return [] as Array<{
      label: string;
      value: string | number;
    }>;
  }

  const observations: Array<{
    label: string;
    value: string | number;
  }> = [];

  for (const feature of input.features) {
    const value = resolveMetricValue(feature, input);

    if (value === null || value === undefined) {
      continue;
    }

    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const label = [stateName, constituencyName].filter(Boolean).join(" - ") || "Unknown";
    observations.push({
      label,
      value,
    });
  }

  return observations;
}

function buildNumericDistribution(values: Array<{ label: string; value: number }>): AnalyticsDistributionDatum[] {
  if (values.length === 0) {
    return [];
  }

  const sorted = values.map((item) => item.value).sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  if (min === max) {
    return [createDistributionDatum(formatCompact(min), min, max, values.length, values.length, 0)];
  }

  const binCount = Math.min(DISTRIBUTION_BIN_LIMIT, Math.max(4, Math.round(Math.sqrt(values.length))));
  const binSize = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const binMin = min + index * binSize;
    const binMax = index === binCount - 1 ? max : min + (index + 1) * binSize;
    const label = `${formatCompact(binMin)} - ${formatCompact(binMax)}`;
    return createDistributionDatum(label, binMin, binMax, 0, values.length, index);
  });

  for (const item of values) {
    const relativeIndex = Math.min(binCount - 1, Math.floor((item.value - min) / binSize));
    const nextCount = bins[relativeIndex].count + 1;
    bins[relativeIndex] = {
      ...bins[relativeIndex],
      count: nextCount,
      percentage: values.length > 0 ? (nextCount / values.length) * 100 : 0,
    };
  }

  return bins;
}

function buildCategoricalDistribution(
  values: Array<{ label: string; value: string }>,
): AnalyticsDistributionDatum[] {
  if (values.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();
  values.forEach((item) => {
    counts.set(item.value, (counts.get(item.value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count], index) => createDistributionDatum(label, index, index, count, values.length, index));
}

export function createMetricDistributionChartModel(
  input: AnalyticsChartTransformInput,
): AnalyticsDistributionChartModel {
  const base = buildBaseModel(
    input,
    "metricDistribution",
    "distribution",
    "Metric distribution",
    "Histogram-style view of the selected choropleth metric.",
    "No metric values are available for distribution analysis.",
  );

  const observations = buildMetricObservations(input);
  const descriptor = input.selectedMetricDescriptor;
  const metricKind = descriptor?.kind ?? input.selectedMetricKind;

  const numericValues =
    metricKind === "numeric"
      ? observations
          .map((item) => ({ label: item.label, value: Number(item.value) }))
          .filter((item) => Number.isFinite(item.value))
      : [];

  const categoricalValues =
    metricKind === "categorical"
      ? observations
          .map((item) => ({ label: item.label, value: String(item.value) }))
          .filter((item) => Boolean(item.value.trim()))
      : [];

  const data =
    metricKind === "numeric" ? buildNumericDistribution(numericValues) : buildCategoricalDistribution(categoricalValues);

  return {
    ...base,
    totalItems: observations.length,
    data,
    xAxisLabel: metricKind === "numeric" ? input.selectedMetricLabel ?? "Metric value" : "Category",
    yAxisLabel: metricKind === "numeric" ? "Constituencies" : "Count",
    binSizeLabel: metricKind === "numeric" ? "Histogram bins" : "Category buckets",
    status: base.status === "ready" && data.length === 0 ? "empty" : base.status,
    emptyMessage: base.emptyMessage,
  };
}

export function createMetricTrendChartModel(
  input: AnalyticsChartTransformInput,
): AnalyticsTrendChartModel {
  const base = buildBaseModel(
    input,
    "metricTrend",
    "trend",
    "Metric trend",
    "Ranked view of the selected choropleth metric.",
    "No metric trend data is available for the current selection.",
  );

  const observations = buildMetricObservations(input);
  const descriptor = input.selectedMetricDescriptor;
  const metricKind = descriptor?.kind ?? input.selectedMetricKind;

  const data =
    metricKind === "numeric"
      ? observations
          .map((item) => ({ label: item.label, value: Number(item.value) }))
          .filter((item) => Number.isFinite(item.value))
          .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
          .slice(0, TREND_LIMIT)
          .map((item, index) => createTrendDatum(item.label, item.value, index + 1))
      : Array.from(
          observations.reduce((acc, item) => {
            const key = String(item.value);
            acc.set(key, (acc.get(key) ?? 0) + 1);
            return acc;
          }, new Map<string, number>()),
        )
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
          .slice(0, TREND_LIMIT)
          .map((item, index) => createTrendDatum(item.label, item.value, index + 1));

  return {
    ...base,
    totalItems: observations.length,
    data,
    xAxisLabel: metricKind === "numeric" ? "Rank" : "Category rank",
    yAxisLabel: metricKind === "numeric" ? input.selectedMetricLabel ?? "Value" : "Count",
    status: base.status === "ready" && data.length === 0 ? "empty" : base.status,
    emptyMessage: base.emptyMessage,
  };
}

export function buildAnalyticsChartModels(input: AnalyticsChartTransformInput): AnalyticsChartModel[] {
  return [
    createPartySeatBarChartModel(input),
    createPartySharePieChartModel(input),
    createMetricTrendChartModel(input),
    createMetricDistributionChartModel(input),
  ];
}

export function getChartModelValueLabel(value: number): string {
  return formatCompact(value);
}

export function getChartModelPercentageLabel(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}

export function getChartModelIntegerLabel(value: number): string {
  return formatInteger(value);
}
