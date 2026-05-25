/**
 * Utility functions for filter operations.
 *
 * Provides:
 * - Range calculations and formatting
 * - Filter composition and chaining
 * - Data statistics calculation
 * - Filter state serialization
 */

import type { ElectionMetricsIndex, ElectionMetrics } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

/**
 * Calculate statistics for a numeric field across features.
 * Useful for setting filter bounds.
 */
export function calculateFieldStatistics(
  features: GeoJSONFeature<Record<string, unknown>>[],
  metricsIndex: ElectionMetricsIndex,
  fieldExtractor: (metrics: ElectionMetrics) => number | null,
): {
  min: number;
  max: number;
  mean: number;
  median: number;
  values: number[];
} {
  const values: number[] = [];

  for (const feature of features) {
    const props = feature.properties || {};
    const stateName = String(props.state_name ?? props.STATE_NAME ?? props.state ?? "");
    const constituencyName = String(props.constituency_name ?? props.CONSTITUENCY_NAME ?? props.name ?? "");

    const key = `${stateName.toUpperCase()}|${constituencyName.toUpperCase()}`;
    const metrics = metricsIndex[key];

    if (metrics) {
      const value = fieldExtractor(metrics);
      if (value !== null && !isNaN(value)) {
        values.push(value);
      }
    }
  }

  if (values.length === 0) {
    return { min: 0, max: 100, mean: 50, median: 50, values: [] };
  }

  values.sort((a, b) => a - b);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = values[Math.floor(values.length / 2)];

  return { min, max, mean, median, values };
}

/**
 * Get all unique parties from features.
 */
export function extractUniqueParties(
  features: GeoJSONFeature<Record<string, unknown>>[],
  metricsIndex: ElectionMetricsIndex,
): Array<{ name: string; count: number }> {
  const partyCounts = new Map<string, number>();

  for (const feature of features) {
    const props = feature.properties || {};
    const stateName = String(props.state_name ?? props.STATE_NAME ?? props.state ?? "");
    const constituencyName = String(props.constituency_name ?? props.CONSTITUENCY_NAME ?? props.name ?? "");

    const key = `${stateName.toUpperCase()}|${constituencyName.toUpperCase()}`;
    const metrics = metricsIndex[key];

    if (metrics?.winner_party) {
      partyCounts.set(metrics.winner_party, (partyCounts.get(metrics.winner_party) ?? 0) + 1);
    }
  }

  return Array.from(partyCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique states from features.
 */
export function extractUniqueStates(
  features: GeoJSONFeature<Record<string, unknown>>[],
): Array<{ name: string; count: number }> {
  const stateCounts = new Map<string, number>();

  for (const feature of features) {
    const props = feature.properties || {};
    const stateName = String(props.state_name ?? props.STATE_NAME ?? props.state ?? "Unknown");

    stateCounts.set(stateName, (stateCounts.get(stateName) ?? 0) + 1);
  }

  return Array.from(stateCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Format a number as a readable vote count.
 */
export function formatVoteCount(votes: number): string {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M`;
  }
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(1)}K`;
  }
  return votes.toString();
}

/**
 * Format a percentage value.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get human-readable filter description.
 */
export function getFilterDescription(filterType: string, value: string | number | string[]): string {
  switch (filterType) {
    case "party":
      if (Array.isArray(value)) {
        return value.length === 1 ? `Party: ${value[0]}` : `Parties: ${value.length} selected`;
      }
      return `Party: ${value}`;

    case "state":
      if (Array.isArray(value)) {
        return value.length === 1 ? `State: ${value[0]}` : `States: ${value.length} selected`;
      }
      return `State: ${value}`;

    case "marginPercentage":
      if (typeof value === "string") {
        return `Margin: ${value}`;
      }
      if (Array.isArray(value)) {
        return `Margin: ${value.join(", ")}`;
      }
      return `Margin: ${formatPercentage(value)}`;

    case "totalVotes":
      if (typeof value === "string") {
        return `Total Votes: ${value}`;
      }
      if (Array.isArray(value)) {
        return `Total Votes: ${value.join(", ")}`;
      }
      return `Total Votes: ${formatVoteCount(value)}`;

    case "winnerVotes":
      if (typeof value === "string") {
        return `Winner Votes: ${value}`;
      }
      if (Array.isArray(value)) {
        return `Winner Votes: ${value.join(", ")}`;
      }
      return `Winner Votes: ${formatVoteCount(value)}`;

    default:
      return String(value);
  }
}

/**
 * Determine appropriate range step for slider based on min/max.
 */
export function calculateRangeStep(min: number, max: number, defaultSteps: number = 10): number {
  const range = max - min;
  const step = range / defaultSteps;
  return step > 0 ? Math.ceil(step) : 1;
}

/**
 * Format range for display (e.g., "100K - 500K").
 */
export function formatRangeDisplay(
  min: number,
  max: number,
  formatter: (value: number) => string = formatVoteCount,
): string {
  return `${formatter(min)} - ${formatter(max)}`;
}

/**
 * Validate filter range values.
 */
export function validateRangeValues(
  min: number,
  max: number,
  absMin: number = 0,
  absMax: number = Number.MAX_SAFE_INTEGER,
): { valid: boolean; error?: string } {
  if (min > max) {
    return { valid: false, error: "Minimum value cannot be greater than maximum" };
  }
  if (min < absMin) {
    return { valid: false, error: `Minimum value cannot be less than ${absMin}` };
  }
  if (max > absMax) {
    return { valid: false, error: `Maximum value cannot be greater than ${absMax}` };
  }
  return { valid: true };
}

/**
 * Calculate percentage of features matching a filter.
 */
export function calculateFilterMatchPercentage(
  totalFeatures: number,
  matchedFeatures: number,
): number {
  if (totalFeatures === 0) return 100;
  return (matchedFeatures / totalFeatures) * 100;
}

/**
 * Get filter impact metrics.
 */
export function calculateFilterImpact(totalFeatures: number, filteredCount: number) {
  const matchedCount = totalFeatures - filteredCount;
  const matchPercentage = calculateFilterMatchPercentage(totalFeatures, matchedCount);

  return {
    totalFeatures,
    matchedFeatures: matchedCount,
    filteredFeatures: filteredCount,
    matchPercentage,
    filterPercentage: 100 - matchPercentage,
    message:
      filteredCount === 0
        ? "No features filtered out"
        : `${filteredCount} feature${filteredCount > 1 ? "s" : ""} filtered out (${(100 - matchPercentage).toFixed(1)}%)`,
  };
}

/**
 * Debounce helper for filter updates.
 * Prevents excessive re-renders from rapid filter changes.
 */
export function createFilterDebounce(callback: () => void, delay: number = 300) {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    execute: () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    },
    cancel: () => {
      if (timeoutId) clearTimeout(timeoutId);
    },
  };
}

/**
 * Serialize filter state to JSON string.
 */
export function serializeFilterState(filters: {
  party?: { values: string[]; enabled: boolean };
  state?: { values: string[]; enabled: boolean };
  marginPercentage?: { min: number; max: number; enabled: boolean };
  totalVotes?: { min: number; max: number; enabled: boolean };
  winnerVotes?: { min: number; max: number; enabled: boolean };
}): string {
  return JSON.stringify(filters);
}

/**
 * Deserialize filter state from JSON string.
 */
export function deserializeFilterState(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    console.error("Failed to deserialize filter state");
    return null;
  }
}

/**
 * Generate filter change log entry.
 */
export function createFilterChangeLog(
  filterType: string,
  oldValue: string | number,
  newValue: string | number,
) {
  return {
    timestamp: new Date().toISOString(),
    filterType,
    oldValue,
    newValue,
    change: `${filterType}: ${oldValue} → ${newValue}`,
  };
}
