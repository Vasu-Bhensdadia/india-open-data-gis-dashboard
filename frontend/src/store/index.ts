/**
 * Centralized store module for GIS dashboard.
 *
 * This module exports all dashboard state management utilities:
 * - Store: useDashboardStore
 * - Types: DashboardState, DashboardActions, DashboardStore
 * - Selectors: Reusable selector functions
 *
 * Usage:
 * ```typescript
 * import { useDashboardStore, selectSelectedConstituency } from '@/store';
 *
 * // In a component:
 * const constituency = useDashboardStore(selectSelectedConstituency);
 * const { selectConstituency } = useDashboardStore();
 * ```
 */

// Export store
export { useDashboardStore } from "./dashboard.store";
export type { DashboardStore, DashboardActions } from "./dashboard.store";

// Export types
export type {
  DashboardState,
  MapInteractionState,
  ConstituencySelection,
  StateFilter,
  PartyFilter,
  VoteRangeFilter,
  TurnoutFilter,
  MarginPercentageFilter,
  TotalVotesFilter,
  WinnerVotesFilter,
  ChoroplethMode,
  RangeFilter,
} from "./dashboard.types";
export { DEFAULT_DASHBOARD_STATE } from "./dashboard.types";

// Export selectors
export {
  // Constituency selection
  selectSelectedConstituencyId,
  selectSelectedConstituencyName,
  selectSelectedConstituency,
  selectHoveredConstituencyId,
  selectHoveredConstituencyName,
  selectHoveredConstituency,
  selectConstituencySelection,
  // Map features
  selectHoveredFeature,
  selectSelectedFeature,
  selectActiveRegionMetadata,
  // Map interactions
  selectMapInteraction,
  selectMapInteractionMode,
  selectIsMapDragging,
  selectIsResettingMapView,
  selectMapViewLevel,
  selectLastInteractedFeatureId,
  // Choropleth
  selectChoroplethMode,
  selectSelectedMetricKey,
  selectIsChoroplethConfigLoaded,
  selectMetricConfig,
  selectActiveMetricDescriptor,
  // State filter
  selectStateFilter,
  selectStateFilterCodes,
  selectStateFilterNames,
  selectIsStateFilterEnabled,
  selectStateFilterCount,
  // Party filter
  selectPartyFilter,
  selectPartyFilterNames,
  selectIsPartyFilterEnabled,
  selectPartyFilterCount,
  createSelectIsPartyFiltered,
  // Vote range filter
  selectVoteRangeFilter,
  selectVoteRangeMin,
  selectVoteRangeMax,
  selectIsVoteRangeFilterEnabled,
  // Margin percentage filter
  selectMarginPercentageFilter,
  selectMarginPercentageMin,
  selectMarginPercentageMax,
  selectIsMarginPercentageFilterEnabled,
  // Total votes filter
  selectTotalVotesFilter,
  selectTotalVotesMin,
  selectTotalVotesMax,
  selectIsTotalVotesFilterEnabled,
  // Winner votes filter
  selectWinnerVotesFilter,
  selectWinnerVotesMin,
  selectWinnerVotesMax,
  selectIsWinnerVotesFilterEnabled,
  // Turnout filter
  selectTurnoutFilter,
  selectTurnoutMin,
  selectTurnoutMax,
  selectIsTurnoutFilterEnabled,
  // Derived
  selectHasActiveFilters,
  selectActiveFiltersSummary,
  selectFiltersSnapshot,
  // UI state
  selectIsFilterPanelOpen,
  selectIsAnalyticsPanelOpen,
  selectActiveAnalyticsTab,
  // Combined
  selectDashboardState,
  selectUIState,
  selectAllFilters,
  selectMapState,
  selectVisualizationState,
} from "./dashboard.selectors";
