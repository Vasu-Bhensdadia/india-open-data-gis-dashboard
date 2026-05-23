import { loadElectionMetrics, getElectionMetrics, getPartyColor } from "@/services/election-metrics.service";
import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "../types/choropleth";
import type { GeoJSONFeature } from "@/types/geojson";
import type { LegendConfig } from "@/lib/visualization/legendTypes";

export const CHOROPLETH_METRIC_CONFIG: Record<
  ChoroplethMetricKey,
  ChoroplethMetricDescriptor<Record<string, unknown>>
> = {} as Record<
  ChoroplethMetricKey,
  ChoroplethMetricDescriptor<Record<string, unknown>>
>;

export async function createChoroplethMetricConfig(): Promise<
  Record<string, ChoroplethMetricDescriptor<Record<string, unknown>>>
> {
  const metrics = await loadElectionMetrics();

  function getCleanMetrics(properties: Record<string, unknown>) {
    const stateName = String(
      properties.state_name ?? properties.STATE_NAME ?? properties.st_name ?? properties.ST_NAME ?? ""
    );
    const constituencyName = String(
      properties.constituency_name ?? properties.CONSTITUENCY_NAME ?? properties.pc_name ?? properties.PC_NAME ?? properties.name ?? ""
    );
    return getElectionMetrics(stateName, constituencyName, metrics);
  }

  return {
    boundaryOnly: {
      key: "boundaryOnly",
      kind: "categorical",
      label: "Base Map (Boundaries)",
      description: "Constituency boundaries without data shading.",
      categoryColorMap: {},
      defaultCategoryColor: "#e2e8f0",
      formatValue: () => "-",
      extractValue: () => null, // Returning null forces the map to use the default border/fill style
    },
    winningParty: {
      key: "winningParty",
      kind: "categorical",
      label: "Winning Party",
      description: "Party that won the constituency.",
      categoryColorMap: {
        "Bharatiya Janata Party": getPartyColor("Bharatiya Janata Party"),
        "Indian National Congress": getPartyColor("Indian National Congress"),
        "All India Trinamool Congress": getPartyColor("All India Trinamool Congress"),
        "Samajwadi Party": getPartyColor("Samajwadi Party"),
        "Dravida Munnetra Kazhagam": getPartyColor("Dravida Munnetra Kazhagam"),
        "Telugu Desam": getPartyColor("Telugu Desam"),
        "Janata Dal (United)": getPartyColor("Janata Dal (United)"),
        "Shiv Sena": getPartyColor("Shiv Sena"),
        "Yuvajana Sramika Rythu Congress Party": getPartyColor("Yuvajana Sramika Rythu Congress Party")
      },
      defaultCategoryColor: "#9ca3af",
      formatValue: (value) => String(value ?? "Unknown"),
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;
        return getCleanMetrics(properties)?.winner_party ?? null;
      },
    },
    marginPercentage: {
      key: "marginPercentage",
      kind: "numeric",
      label: "Winner Margin %",
      description: "Percentage difference in votes between winner and runner up.",
      colorScale: {
        emptyColor: "#f8fafc",
        stops: [
          { value: 2, color: "#fee2e2" },
          { value: 10, color: "#fca5a5" },
          { value: 20, color: "#f87171" },
          { value: 35, color: "#ef4444" },
          { value: 50, color: "#b91c1c" },
        ],
      },
      formatValue: (value) => `${Number(value).toFixed(1)}%`,
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;
        return getCleanMetrics(properties)?.winner_margin_percentage ?? null;
      },
    },
    totalVotes: {
      key: "totalVotes",
      kind: "numeric",
      label: "Total Votes",
      description: "Total number of votes cast in the constituency.",
      colorScale: {
        emptyColor: "#f8fafc",
        stops: [
          { value: 800000, color: "#eff6ff" },
          { value: 1000000, color: "#bfdbfe" },
          { value: 1200000, color: "#60a5fa" },
          { value: 1400000, color: "#2563eb" },
          { value: 1600000, color: "#1e40af" },
        ],
      },
      formatValue: (value) => Number(value).toLocaleString(),
      extractValue: (feature) => {
        const properties = feature.properties as Record<string, unknown> | undefined;
        if (!properties) return null;
        return getCleanMetrics(properties)?.total_votes ?? null;
      },
    },
  };
}

export function getChoroplethMetricLegendConfig(
  descriptor: ChoroplethMetricDescriptor<Record<string, unknown>>,
): LegendConfig {
  if (descriptor.key === "boundaryOnly") {
    return {
      type: "categorical",
      title: descriptor.label,
      items: [
        { label: "Constituency Area", color: "#e2e8f0" } // Shows a blank square in the legend
      ],
    };
  }

  if (descriptor.kind === "categorical") {
    return {
      type: "categorical",
      title: descriptor.label,
      items: [
        { label: "BJP", color: getPartyColor("Bharatiya Janata Party") },
        { label: "INC", color: getPartyColor("Indian National Congress") },
        { label: "TMC", color: getPartyColor("All India Trinamool Congress") },
        { label: "SP", color: getPartyColor("Samajwadi Party") },
        { label: "DMK", color: getPartyColor("Dravida Munnetra Kazhagam") },
        { label: "Other", color: "#9ca3af" },
      ],
    };
  }

  return {
    type: "gradient",
    title: descriptor.label,
    items: descriptor.colorScale.stops.map((stop) => ({
      label: `${stop.value}`,
      color: stop.color,
      from: stop.value,
      to: stop.value,
    })),
    minLabel: descriptor.colorScale.stops[0]?.value.toString(),
    maxLabel: descriptor.colorScale.stops[descriptor.colorScale.stops.length - 1]?.value.toString(),
  };
}

export function choroplethStyleResolver<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  feature: GeoJSONFeature<TProperties> | undefined,
  metric: ChoroplethMetricDescriptor<TProperties>,
): Record<string, unknown> {

  if (metric.key === "boundaryOnly") {
    return {
      fillColor: "#ffffff", // Completely solid white background
      fillOpacity: 0,       // 100% solid, NOT transparent
      color: "#2563eb",     // Strong blue border
      weight: 1.2,          // Slightly thicker line to look like a KML layer
      opacity: 1,           // Solid border line
    };
  }

  const defaultStyle = {
    fillColor: "#e2e8f0",
    weight: 1,
    opacity: 1,
    color: "#cbd5e1",
    fillOpacity: 0.8,
  };

  if (!feature || !metric) return defaultStyle;

  const value = metric.extractValue(feature);
  if (value === null || value === undefined) return defaultStyle;

  let fillColor = defaultStyle.fillColor;

  if (metric.kind === "categorical") {
    fillColor = metric.categoryColorMap[String(value)] ?? getPartyColor(String(value)) ?? metric.defaultCategoryColor;
  } else if (metric.kind === "numeric") {
    const numericValue = Number(value);
    const stops = metric.colorScale.stops;

    fillColor = stops[0].color;
    for (let i = 0; i < stops.length; i++) {
      if (numericValue >= stops[i].value) {
        fillColor = stops[i].color;
      }
    }
  }

  return {
    ...defaultStyle,
    fillColor,
  };
}
