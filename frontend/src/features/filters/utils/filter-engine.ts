/**
 * Core filtering engine for analytics dashboard.
 *
 * Applies multiple simultaneous filters to GeoJSON features based on election metrics.
 * Supports:
 * - Political party filtering
 * - State/constituency filtering
 * - Numeric range filters (votes, margins, etc.)
 *
 * Design:
 * - Stateless filtering functions
 * - Supports both sync and async data loading
 * - Provides detailed filter statistics
 * - Optimized for performance with large feature collections
 */

import type { GeoJSONFeature } from "@/types/geojson";
import type { ElectionMetrics, ElectionMetricsIndex } from "@/services/election-metrics.service";
import { getElectionMetrics } from "@/services/election-metrics.service";
import type {
  FilterConfig,
  FilterPredicate,
  FilterResult,
  DetailedFilterResult,
  FilterSnapshot,
} from "../types/filter.types";
import type {
  PartyFilter,
  StateFilter,
  MarginPercentageFilter,
  TotalVotesFilter,
  WinnerVotesFilter,
} from "@/store/dashboard.types";

/**
 * Extract constituency and state names from GeoJSON feature properties.
 */
export function extractGeoJSONMetadataKey(feature: GeoJSONFeature<Record<string, unknown>>): {
  stateName: string;
  constituencyName: string;
} {
  const props = feature.properties || {};

  // Try multiple property name patterns (different data sources may use different names)
  const stateName = String(
    props.state_name ??
      props.STATE_NAME ??
      props.st_name ??
      props.ST_NAME ??
      props.state ??
      "Unknown State",
  );

  const constituencyName = String(
    props.constituency_name ??
      props.CONSTITUENCY_NAME ??
      props.pc_name ??
      props.PC_NAME ??
      props.name ??
      props.NAME ??
      "Unknown Constituency",
  );

  return { stateName, constituencyName };
}

/**
 * Create a predicate function from filter configuration.
 * Returns a function that checks if a feature matches the filters.
 */
export function createFilterPredicate(filters: FilterConfig): FilterPredicate {
  return (feature: GeoJSONFeature<Record<string, unknown>>, metrics: ElectionMetrics | null) => {
    // Party filter
    if (filters.party.enabled && filters.party.values.size > 0) {
      if (!metrics?.winner_party) return false;
      if (!filters.party.values.has(metrics.winner_party)) return false;
    }

    // State filter
    if (filters.state.enabled && filters.state.values.size > 0) {
      const { stateName } = extractGeoJSONMetadataKey(feature);
      if (!filters.state.values.has(stateName)) return false;
    }

    // Margin percentage filter
    if (filters.marginPercentage.enabled) {
      if (metrics?.winner_margin_percentage === undefined) return false;
      if (
        metrics.winner_margin_percentage < filters.marginPercentage.min ||
        metrics.winner_margin_percentage > filters.marginPercentage.max
      ) {
        return false;
      }
    }

    // Total votes filter
    if (filters.totalVotes.enabled) {
      if (metrics?.total_votes === undefined) return false;
      if (
        metrics.total_votes < filters.totalVotes.min ||
        metrics.total_votes > filters.totalVotes.max
      ) {
        return false;
      }
    }

    // Winner votes filter
    if (filters.winnerVotes.enabled) {
      if (metrics?.winner_votes === undefined) return false;
      if (
        metrics.winner_votes < filters.winnerVotes.min ||
        metrics.winner_votes > filters.winnerVotes.max
      ) {
        return false;
      }
    }

    return true;
  };
}

/**
 * Check if any filters are currently active.
 */
export type DashboardFilterState = {
  stateFilter: StateFilter;
  partyFilter: PartyFilter;
  marginPercentageFilter: MarginPercentageFilter;
  totalVotesFilter: TotalVotesFilter;
  winnerVotesFilter: WinnerVotesFilter;
};

export function mapDashboardFiltersToEngineConfig(filters: DashboardFilterState): FilterConfig {
  return {
    party: {
      type: "set",
      values: filters.partyFilter.partyNames,
      enabled: filters.partyFilter.enabled,
    },
    state: {
      type: "set",
      values: filters.stateFilter.stateNames,
      enabled: filters.stateFilter.enabled,
    },
    marginPercentage: {
      type: "range",
      min: filters.marginPercentageFilter.min,
      max: filters.marginPercentageFilter.max,
      enabled: filters.marginPercentageFilter.enabled,
    },
    totalVotes: {
      type: "range",
      min: filters.totalVotesFilter.min,
      max: filters.totalVotesFilter.max,
      enabled: filters.totalVotesFilter.enabled,
    },
    winnerVotes: {
      type: "range",
      min: filters.winnerVotesFilter.min,
      max: filters.winnerVotesFilter.max,
      enabled: filters.winnerVotesFilter.enabled,
    },
  };
}

export function hasActiveFilters(filters: FilterConfig): boolean {
  return (
    (filters.party.enabled && filters.party.values.size > 0) ||
    (filters.state.enabled && filters.state.values.size > 0) ||
    filters.marginPercentage.enabled ||
    filters.totalVotes.enabled ||
    filters.winnerVotes.enabled
  );
}

/**
 * Apply filters to a GeoJSON feature collection.
 * Returns features that match all enabled filters.
 */
export function applyFilters(
  features: GeoJSONFeature<Record<string, unknown>>[],
  filters: FilterConfig,
  metricsIndex: ElectionMetricsIndex,
): FilterResult {
  const predicate = createFilterPredicate(filters);
  const passedFeatures: typeof features = [];
  const filteredFeatures: typeof features = [];

  for (const feature of features) {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    if (predicate(feature, metrics)) {
      passedFeatures.push(feature);
    } else {
      filteredFeatures.push(feature);
    }
  }

  return {
    passedFeatures,
    filteredFeatures,
    statistics: {
      totalFeatures: features.length,
      matchedFeatures: passedFeatures.length,
      filteredOutCount: filteredFeatures.length,
      filterPercentage: features.length > 0 ? (filteredFeatures.length / features.length) * 100 : 0,
    },
  };
}

/**
 * Apply filters with detailed breakdown by filter type.
 * Useful for analytics and debugging.
 */
export function applyFiltersWithBreakdown(
  features: GeoJSONFeature<Record<string, unknown>>[],
  filters: FilterConfig,
  metricsIndex: ElectionMetricsIndex,
): DetailedFilterResult {
  const result = applyFilters(features, filters, metricsIndex);

  // Calculate breakdown by checking each filter individually
  const breakdown = {
    partyFilter: { passed: 0, failed: 0 },
    stateFilter: { passed: 0, failed: 0 },
    marginFilter: { passed: 0, failed: 0 },
    totalVotesFilter: { passed: 0, failed: 0 },
    winnerVotesFilter: { passed: 0, failed: 0 },
  };

  for (const feature of features) {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    // Party filter
    if (filters.party.enabled && filters.party.values.size > 0) {
      if (metrics?.winner_party && filters.party.values.has(metrics.winner_party)) {
        breakdown.partyFilter.passed++;
      } else {
        breakdown.partyFilter.failed++;
      }
    }

    // State filter
    if (filters.state.enabled && filters.state.values.size > 0) {
      if (filters.state.values.has(stateName)) {
        breakdown.stateFilter.passed++;
      } else {
        breakdown.stateFilter.failed++;
      }
    }

    // Margin filter
    if (filters.marginPercentage.enabled) {
      if (
        metrics?.winner_margin_percentage !== undefined &&
        metrics.winner_margin_percentage >= filters.marginPercentage.min &&
        metrics.winner_margin_percentage <= filters.marginPercentage.max
      ) {
        breakdown.marginFilter.passed++;
      } else {
        breakdown.marginFilter.failed++;
      }
    }

    // Total votes filter
    if (filters.totalVotes.enabled) {
      if (
        metrics?.total_votes !== undefined &&
        metrics.total_votes >= filters.totalVotes.min &&
        metrics.total_votes <= filters.totalVotes.max
      ) {
        breakdown.totalVotesFilter.passed++;
      } else {
        breakdown.totalVotesFilter.failed++;
      }
    }

    // Winner votes filter
    if (filters.winnerVotes.enabled) {
      if (
        metrics?.winner_votes !== undefined &&
        metrics.winner_votes >= filters.winnerVotes.min &&
        metrics.winner_votes <= filters.winnerVotes.max
      ) {
        breakdown.winnerVotesFilter.passed++;
      } else {
        breakdown.winnerVotesFilter.failed++;
      }
    }
  }

  return {
    ...result,
    filterBreakdown: breakdown,
  };
}

/**
 * Create a filter snapshot for serialization/debugging.
 */
export function createFilterSnapshot(filters: FilterConfig): FilterSnapshot {
  return {
    party: {
      values: Array.from(filters.party.values),
      enabled: filters.party.enabled,
    },
    state: {
      values: Array.from(filters.state.values),
      enabled: filters.state.enabled,
    },
    marginPercentage: {
      min: filters.marginPercentage.min,
      max: filters.marginPercentage.max,
      enabled: filters.marginPercentage.enabled,
    },
    totalVotes: {
      min: filters.totalVotes.min,
      max: filters.totalVotes.max,
      enabled: filters.totalVotes.enabled,
    },
    winnerVotes: {
      min: filters.winnerVotes.min,
      max: filters.winnerVotes.max,
      enabled: filters.winnerVotes.enabled,
    },
  };
}

/**
 * Get readable descriptions of active filters.
 */
export function getActiveFilterDescriptions(filters: FilterConfig): string[] {
  const descriptions: string[] = [];

  if (filters.party.enabled && filters.party.values.size > 0) {
    if (filters.party.values.size === 1) {
      descriptions.push(`Party: ${Array.from(filters.party.values)[0]}`);
    } else {
      descriptions.push(`Parties: ${filters.party.values.size} selected`);
    }
  }

  if (filters.state.enabled && filters.state.values.size > 0) {
    if (filters.state.values.size === 1) {
      descriptions.push(`State: ${Array.from(filters.state.values)[0]}`);
    } else {
      descriptions.push(`States: ${filters.state.values.size} selected`);
    }
  }

  if (filters.marginPercentage.enabled) {
    descriptions.push(
      `Margin: ${filters.marginPercentage.min.toFixed(1)}% - ${filters.marginPercentage.max.toFixed(1)}%`,
    );
  }

  if (filters.totalVotes.enabled) {
    descriptions.push(
      `Total Votes: ${filters.totalVotes.min.toLocaleString()} - ${filters.totalVotes.max.toLocaleString()}`,
    );
  }

  if (filters.winnerVotes.enabled) {
    descriptions.push(
      `Winner Votes: ${filters.winnerVotes.min.toLocaleString()} - ${filters.winnerVotes.max.toLocaleString()}`,
    );
  }

  return descriptions;
}

/**
 * Merge multiple filter configurations.
 * Later filters override earlier ones.
 */
export function mergeFilters(...filterConfigs: Partial<FilterConfig>[]): FilterConfig {
  const defaultConfig: FilterConfig = {
    party: { type: "set", values: new Set(), enabled: false },
    state: { type: "set", values: new Set(), enabled: false },
    marginPercentage: { type: "range", min: 0, max: 100, enabled: false },
    totalVotes: { type: "range", min: 0, max: 10000000, enabled: false },
    winnerVotes: { type: "range", min: 0, max: 10000000, enabled: false },
  };

  return filterConfigs.reduce<FilterConfig>(
    (acc, config) => ({
      ...acc,
      ...config,
    }),
    defaultConfig,
  );
}
