/**
 * Filter module exports.
 *
 * Central point for accessing all filter-related utilities, hooks, and types.
 */

// Types
export type {
  FilterConfig,
  FilterPredicate,
  FilterResult,
  DetailedFilterResult,
  FilterSnapshot,
  FilterChangeEvent,
  FilterChangeListener,
  FilterStatus,
  NumericRangeFilterConfig,
  SetFilterConfig,
} from "./types/filter.types";

// Filter Engine
export {
  applyFilters,
  applyFiltersWithBreakdown,
  createFilterPredicate,
  createFilterSnapshot,
  extractGeoJSONMetadataKey,
  getActiveFilterDescriptions,
  hasActiveFilters,
  mergeFilters,
} from "./utils/filter-engine";

// Filter Utilities
export {
  calculateFieldStatistics,
  calculateFilterImpact,
  calculateFilterMatchPercentage,
  calculateRangeStep,
  createFilterChangeLog,
  createFilterDebounce,
  deserializeFilterState,
  extractUniqueParties,
  extractUniqueStates,
  formatPercentage,
  formatRangeDisplay,
  formatVoteCount,
  getFilterDescription,
  serializeFilterState,
  validateRangeValues,
} from "./utils/filter-utils";

// React Hooks - Filter Engine
export {
  useDetailedFilterEngine,
  useFeatureFilter,
  useFilterDescriptions,
  useFilterEngine,
  useFilterSnapshot,
  useFilterState,
  useFilteredGeoJSON,
} from "./hooks/useFilterEngine";

// React Hooks - Map Integration
export {
  createFeatureVisibilityChecker,
  useFilterAwareSelection,
  useFilteredFeatureColor,
  useFilteredFeatureStyle,
  useFilterStatistics,
  useMapFilteredFeatures,
} from "./hooks/useMapIntegration";
