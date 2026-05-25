/**
 * Filter types and configuration for analytics filtering engine.
 *
 * Defines the structure of all supported filters:
 * - Political party filter
 * - State/constituency filter
 * - Vote count ranges
 * - Margin percentage ranges
 * - Total votes ranges
 */

import type { GeoJSONFeature } from "@/types/geojson";
import type { ElectionMetrics } from "@/services/election-metrics.service";

/**
 * A predicate function that determines if a feature passes the filter.
 */
export type FilterPredicate = (
  feature: GeoJSONFeature<Record<string, unknown>>,
  metrics: ElectionMetrics | null,
) => boolean;

/**
 * Numeric range filter definition.
 */
export interface NumericRangeFilterConfig {
  type: "range";
  min: number;
  max: number;
  enabled: boolean;
}

/**
 * Set-based filter (party names, state codes, etc).
 */
export interface SetFilterConfig {
  type: "set";
  values: Set<string>;
  enabled: boolean;
}

/**
 * All filter configurations.
 */
export interface FilterConfig {
  party: SetFilterConfig;
  state: SetFilterConfig;
  marginPercentage: NumericRangeFilterConfig;
  totalVotes: NumericRangeFilterConfig;
  winnerVotes: NumericRangeFilterConfig;
}

/**
 * Filter state for serialization/debugging.
 */
export interface FilterSnapshot {
  party: {
    values: string[];
    enabled: boolean;
  };
  state: {
    values: string[];
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

/**
 * Filter result with statistics.
 */
export interface FilterResult {
  passedFeatures: GeoJSONFeature<Record<string, unknown>>[];
  filteredFeatures: GeoJSONFeature<Record<string, unknown>>[];
  statistics: {
    totalFeatures: number;
    matchedFeatures: number;
    filteredOutCount: number;
    filterPercentage: number;
  };
}

/**
 * Detailed filter application result.
 */
export interface DetailedFilterResult extends FilterResult {
  filterBreakdown: {
    partyFilter: {
      passed: number;
      failed: number;
    };
    stateFilter: {
      passed: number;
      failed: number;
    };
    marginFilter: {
      passed: number;
      failed: number;
    };
    totalVotesFilter: {
      passed: number;
      failed: number;
    };
    winnerVotesFilter: {
      passed: number;
      failed: number;
    };
  };
}

/**
 * Filter change event.
 */
export interface FilterChangeEvent {
  filterType: keyof FilterConfig;
  timestamp: number;
  previousValue: FilterConfig[keyof FilterConfig];
  newValue: FilterConfig[keyof FilterConfig];
}

/**
 * Filter change listener callback.
 */
export type FilterChangeListener = (event: FilterChangeEvent) => void;

/**
 * Filter status for display.
 */
export interface FilterStatus {
  isFiltered: boolean;
  activeFilterCount: number;
  matchedPercentage: number;
  appliedFilters: Array<{
    name: string;
    description: string;
  }>;
}
