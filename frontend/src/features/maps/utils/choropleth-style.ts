import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "./hover-style";
import type {
  ChoroplethCategoricalMetricDescriptor,
  ChoroplethColorScale,
  ChoroplethMetricDescriptor,
  ChoroplethMetricKey,
} from "../types/choropleth";
import {
  loadElectionMetrics,
  getElectionMetrics,
  type ElectionMetricsIndex,
} from "@/services/election-metrics.service";
import { electionPartyColors } from "@/lib/visualization/colorScale";
import {
  buildCategoricalConfig,
  buildGradientConfig,
} from "@/lib/visualization/legendUtils";
import type { LegendConfig } from "@/lib/visualization/legendTypes";

function parseHexColor(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "");
  const normalized = sanitized.length === 3
    ? sanitized.split("").map((char) => char + char).join("")
    : sanitized;

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return [red, green, blue];
}

function interpolateColor(colorA: string, colorB: string, ratio: number): string {
  const [rA, gA, bA] = parseHexColor(colorA);
  const [rB, gB, bB] = parseHexColor(colorB);

  const r = Math.round(rA + (rB - rA) * ratio);
  const g = Math.round(gA + (gB - gA) * ratio);
  const b = Math.round(bA + (bB - bA) * ratio);

  return "#" + [r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function getNumericFillColor(value: number | null, scale: ChoroplethColorScale): string {
  if (value === null || Number.isNaN(value)) {
    return scale.emptyColor;
  }

  const stops = [...scale.stops].sort((a, b) => a.value - b.value);

  if (stops.length === 0) {
    return scale.emptyColor;
  }

  if (value <= stops[0].value) {
    return stops[0].color;
  }

  for (let index = 0; index < stops.length - 1; index += 1) {
    const current = stops[index];
    const next = stops[index + 1];

    if (value <= next.value) {
      const ratio = (value - current.value) / (next.value - current.value);
      return interpolateColor(current.color, next.color, ratio);
    }
  }

  return stops[stops.length - 1].color;
}

function getCategoricalFillColor<TProperties extends Record<string, unknown>>(
  value: string | null,
  metric: ChoroplethCategoricalMetricDescriptor<TProperties>,
): string {
  if (!value) {
    return metric.defaultCategoryColor;
  }

  return metric.categoryColorMap[value] ?? metric.defaultCategoryColor;
}

function getChoroplethFillColor<TProperties extends Record<string, unknown>>(
  value: number | string | null,
  metric: ChoroplethMetricDescriptor<TProperties>,
): string {
  if (metric.kind === "categorical") {
    return getCategoricalFillColor(value as string | null, metric);
  }

  return getNumericFillColor(value as number | null, metric.colorScale);
}

let electionMetricsCache: ElectionMetricsIndex | null = null;

async function initializeElectionMetrics(): Promise<ElectionMetricsIndex> {
  if (electionMetricsCache) {
    return electionMetricsCache;
  }
  electionMetricsCache = await loadElectionMetrics();
  return electionMetricsCache;
}

function createWinnerMarginExtractor(metricsIndex: ElectionMetricsIndex) {
  return (feature: GeoJSONFeature) => {
    const properties = feature.properties as Record<string, unknown> | undefined;
    if (!properties) return null;

    const stateName = String(properties.state_name ?? properties.STATE_NAME ?? "");
    const constituencyName = String(
      properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.name ?? "",
    );

    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);
    return metrics?.winner_margin_percentage ?? null;
  };
}

export async function createChoroplethMetricConfig(): Promise<
  Record<ChoroplethMetricKey, ChoroplethMetricDescriptor<Record<string, unknown>>>
> {
  const metrics = await initializeElectionMetrics();

  return {
    winningParty: {
      key: "winningParty",
      kind: "categorical",
      label: "Winning Party",
      description: "Party that won the constituency.",
      categoryColorMap: electionPartyColors(),
      defaultCategoryColor: "#9ca3af",
      formatValue: (value) => String(value ?? "Unknown"),
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;

        const analytics = properties.analytics as Record<string, unknown> | undefined;
        if (analytics?.winning_party) {
          return String(analytics.winning_party);
        }

        const stateName = String(properties.state_name ?? properties.STATE_NAME ?? "");
        const constituencyName = String(
          properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.name ?? "",
        );

        return getElectionMetrics(stateName, constituencyName, metrics)?.winner_party ?? null;
      },
    },
    turnout: {
      key: "turnout",
      kind: "numeric",
      label: "Turnout Percentage",
      description: "Voter turnout as a percentage of registered voters.",
      colorScale: {
        emptyColor: "#f8fafc",
        stops: [
          { value: 40, color: "#dbeafe" },
          { value: 55, color: "#93c5fd" },
          { value: 65, color: "#3b82f6" },
          { value: 75, color: "#1d4ed8" },
          { value: 90, color: "#1e40af" },
        ],
      },
      formatValue: (value) => `${Number(value).toFixed(1)}%`,
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;

        const analytics = properties.analytics as Record<string, unknown> | undefined;
        if (analytics?.turnout_percentage != null) {
          return Number(analytics.turnout_percentage);
        }

        const stateName = String(properties.state_name ?? properties.STATE_NAME ?? "");
        const constituencyName = String(
          properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.name ?? "",
        );

        return getElectionMetrics(stateName, constituencyName, metrics)?.winner_margin_percentage ?? null;
      },
    },
    literacyRate: {
      key: "literacyRate",
      kind: "numeric",
      label: "Literacy Rate",
      description: "Percentage of literate population in the constituency.",
      colorScale: {
        emptyColor: "#f8fafc",
        stops: [
          { value: 55, color: "#fee2e2" },
          { value: 65, color: "#fca5a5" },
          { value: 75, color: "#f97316" },
          { value: 85, color: "#eab308" },
          { value: 95, color: "#22c55e" },
        ],
      },
      formatValue: (value) => `${Number(value).toFixed(1)}%`,
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;

        const analytics = properties.analytics as Record<string, unknown> | undefined;
        if (analytics?.literacy_rate != null) {
          return Number(analytics.literacy_rate);
        }

        const stateName = String(properties.state_name ?? properties.STATE_NAME ?? "");
        const constituencyName = String(
          properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.name ?? "",
        );

        return getElectionMetrics(stateName, constituencyName, metrics)?.winner_margin_percentage ?? null;
      },
    },
    population: {
      key: "population",
      kind: "numeric",
      label: "Population",
      description: "Population or population proxy for the constituency.",
      colorScale: {
        emptyColor: "#f8fafc",
        stops: [
          { value: 500000, color: "#eff6ff" },
          { value: 1000000, color: "#bfdbfe" },
          { value: 1500000, color: "#60a5fa" },
          { value: 2500000, color: "#2563eb" },
          { value: 4000000, color: "#1e40af" },
        ],
      },
      formatValue: (value) => Number(value).toLocaleString(),
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;

        const analytics = properties.analytics as Record<string, unknown> | undefined;
        if (analytics?.population != null) {
          return Number(analytics.population);
        }

        const stateName = String(properties.state_name ?? properties.STATE_NAME ?? "");
        const constituencyName = String(
          properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.name ?? "",
        );

        return getElectionMetrics(stateName, constituencyName, metrics)?.total_votes ?? null;
      },
    },
  };
}

export function getChoroplethMetricLegendConfig(
  metric: ChoroplethMetricDescriptor,
): LegendConfig {
  if (metric.kind === "categorical") {
    const items = Object.entries(metric.categoryColorMap).map(([label, color]) => ({
      label,
      color,
    }));
    return buildCategoricalConfig(metric.label, items);
  }

  const items = metric.colorScale.stops.map((stop, index, stops) => ({
    label:
      index === 0
        ? `≤ ${stop.value}`
        : `${stops[index - 1].value}–${stop.value}`,
    color: stop.color,
    from: index === 0 ? undefined : stops[index - 1].value,
    to: stop.value,
  }));

  return buildGradientConfig(
    metric.label,
    items,
    String(items[0]?.label),
    String(items[items.length - 1]?.label),
  );
}

// Legacy support - initialize on module load
export let CHOROPLETH_METRIC_CONFIG: Record<
  ChoroplethMetricKey,
  ChoroplethMetricDescriptor<Record<string, unknown>>
> = {
  winningParty: {
    key: "winningParty",
    kind: "categorical",
    label: "Loading...",
    description: "Loading election data...",
    categoryColorMap: {},
    defaultCategoryColor: "#9ca3af",
    formatValue: (v) => String(v),
    extractValue: () => null,
  },
  turnout: {
    key: "turnout",
    kind: "numeric",
    label: "Loading...",
    description: "Loading election data...",
    colorScale: { emptyColor: "#f8fafc", stops: [] },
    formatValue: (v) => String(v),
    extractValue: () => null,
  },
  literacyRate: {
    key: "literacyRate",
    kind: "numeric",
    label: "Loading...",
    description: "Loading election data...",
    colorScale: { emptyColor: "#f8fafc", stops: [] },
    formatValue: (v) => String(v),
    extractValue: () => null,
  },
  population: {
    key: "population",
    kind: "numeric",
    label: "Loading...",
    description: "Loading election data...",
    colorScale: { emptyColor: "#f8fafc", stops: [] },
    formatValue: (v) => String(v),
    extractValue: () => null,
  },
};

// Initialize metrics on module load
if (typeof window !== "undefined") {
  createChoroplethMetricConfig()
    .then((config) => {
      CHOROPLETH_METRIC_CONFIG = config;
    })
    .catch((error) => {
      console.error("Failed to load election metrics:", error);
    });
}

export function createChoroplethStyleResolver<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  metric: ChoroplethMetricDescriptor<TProperties>,
  baseStyle: GeoJSONPathOptions,
): (feature: GeoJSONFeature<TProperties>) => GeoJSONPathOptions {
  return (feature: GeoJSONFeature<TProperties>) => {
    const value = metric.extractValue(feature);
    const fillColor = getChoroplethFillColor(value, metric);
    return {
      ...baseStyle,
      fillColor,
    };
  };
}

export function getChoroplethFeatureValue<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  metric: ChoroplethMetricDescriptor<TProperties>,
  feature: GeoJSONFeature<TProperties>,
): number | string | null {
  return metric.extractValue(feature);
}
