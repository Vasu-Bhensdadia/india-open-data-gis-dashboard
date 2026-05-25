/**
 * Reusable selectors for the dashboard store.
 *
 * Selectors provide efficient, memoized access to derived state.
 * Use selectors in components to avoid unnecessary re-renders.
 *
 * Pattern:
 * ```
 * const selectedConstituency = useDashboardStore(selectSelectedConstituency);
 * ```
 */

import type { DashboardStore } from "./dashboard.store";

// ===== Constituency Selection Selectors =====

export const selectSelectedConstituencyId = (state: DashboardStore) => state.constituencySelection.selectedConstituencyId;

export const selectSelectedConstituencyName = (state: DashboardStore) =>
  state.constituencySelection.selectedConstituencyName;

export const selectSelectedConstituency = (state: DashboardStore) => ({
  id: state.constituencySelection.selectedConstituencyId,
  name: state.constituencySelection.selectedConstituencyName,
});

export const selectHoveredConstituencyId = (state: DashboardStore) => state.constituencySelection.hoveredConstituencyId;

export const selectHoveredConstituencyName = (state: DashboardStore) =>
  state.constituencySelection.hoveredConstituencyName;

export const selectHoveredConstituency = (state: DashboardStore) => ({
  id: state.constituencySelection.hoveredConstituencyId,
  name: state.constituencySelection.hoveredConstituencyName,
});

export const selectConstituencySelection = (state: DashboardStore) => state.constituencySelection;

// ===== Map Feature Selectors =====

export const selectHoveredFeature = (state: DashboardStore) => state.hoveredFeature;

export const selectSelectedFeature = (state: DashboardStore) => state.selectedFeature;

export const selectActiveRegionMetadata = (state: DashboardStore) => state.activeRegionMetadata;

// ===== Map Interaction Selectors =====

export const selectMapInteraction = (state: DashboardStore) => state.mapInteraction;

export const selectMapInteractionMode = (state: DashboardStore) => state.mapInteraction.mode;

export const selectIsMapDragging = (state: DashboardStore) => state.mapInteraction.isDragging;

export const selectIsResettingMapView = (state: DashboardStore) => state.mapInteraction.isResettingView;

export const selectMapViewLevel = (state: DashboardStore) => state.mapInteraction.viewLevel;

export const selectLastInteractedFeatureId = (state: DashboardStore) => state.mapInteraction.lastInteractedFeatureId;

// ===== Choropleth Mode Selectors =====

export const selectChoroplethMode = (state: DashboardStore) => state.choroplethMode;

export const selectSelectedMetricKey = (state: DashboardStore) => state.choroplethMode.selectedMetricKey;

export const selectIsChoroplethConfigLoaded = (state: DashboardStore) => state.choroplethMode.isConfigLoaded;

export const selectMetricConfig = (state: DashboardStore) => state.metricConfig;

/**
 * Get the currently selected metric descriptor.
 * Returns null if config is not loaded.
 */
export const selectActiveMetricDescriptor = (state: DashboardStore) => {
  if (!state.choroplethMode.isConfigLoaded) {
    return null;
  }
  return state.metricConfig[state.choroplethMode.selectedMetricKey] ?? null;
};

// ===== State Filter Selectors =====

export const selectStateFilter = (state: DashboardStore) => state.stateFilter;

export const selectStateFilterCodes = (state: DashboardStore) => Array.from(state.stateFilter.stateCodes);

export const selectStateFilterNames = (state: DashboardStore) => Array.from(state.stateFilter.stateNames);

export const selectIsStateFilterEnabled = (state: DashboardStore) => state.stateFilter.enabled;

export const selectStateFilterCount = (state: DashboardStore) => state.stateFilter.stateCodes.size;

// ===== Party Filter Selectors =====

export const selectPartyFilter = (state: DashboardStore) => state.partyFilter;

export const selectPartyFilterNames = (state: DashboardStore) => Array.from(state.partyFilter.partyNames);

export const selectIsPartyFilterEnabled = (state: DashboardStore) => state.partyFilter.enabled;

export const selectPartyFilterCount = (state: DashboardStore) => state.partyFilter.partyNames.size;

/**
 * Check if a specific party is selected in the filter.
 */
export const createSelectIsPartyFiltered = (partyName: string) => (state: DashboardStore) =>
  state.partyFilter.partyNames.has(partyName);

// ===== Vote Range Filter Selectors =====

export const selectVoteRangeFilter = (state: DashboardStore) => state.voteRangeFilter;

export const selectVoteRangeMin = (state: DashboardStore) => state.voteRangeFilter.min;

export const selectVoteRangeMax = (state: DashboardStore) => state.voteRangeFilter.max;

export const selectIsVoteRangeFilterEnabled = (state: DashboardStore) => state.voteRangeFilter.enabled;

// ===== Margin Percentage Filter Selectors =====

export const selectMarginPercentageFilter = (state: DashboardStore) => state.marginPercentageFilter;

export const selectMarginPercentageMin = (state: DashboardStore) => state.marginPercentageFilter.min;

export const selectMarginPercentageMax = (state: DashboardStore) => state.marginPercentageFilter.max;

export const selectIsMarginPercentageFilterEnabled = (state: DashboardStore) => state.marginPercentageFilter.enabled;

// ===== Total Votes Filter Selectors =====

export const selectTotalVotesFilter = (state: DashboardStore) => state.totalVotesFilter;

export const selectTotalVotesMin = (state: DashboardStore) => state.totalVotesFilter.min;

export const selectTotalVotesMax = (state: DashboardStore) => state.totalVotesFilter.max;

export const selectIsTotalVotesFilterEnabled = (state: DashboardStore) => state.totalVotesFilter.enabled;

// ===== Winner Votes Filter Selectors =====

export const selectWinnerVotesFilter = (state: DashboardStore) => state.winnerVotesFilter;

export const selectWinnerVotesMin = (state: DashboardStore) => state.winnerVotesFilter.min;

export const selectWinnerVotesMax = (state: DashboardStore) => state.winnerVotesFilter.max;

export const selectIsWinnerVotesFilterEnabled = (state: DashboardStore) => state.winnerVotesFilter.enabled;

// ===== Turnout Filter Selectors =====
export const selectTurnoutFilter = (state: DashboardStore) => state.turnoutFilter;

export const selectTurnoutMin = (state: DashboardStore) => state.turnoutFilter.min;

export const selectTurnoutMax = (state: DashboardStore) => state.turnoutFilter.max;

export const selectIsTurnoutFilterEnabled = (state: DashboardStore) => state.turnoutFilter.enabled;

// ===== Derived Filter Selectors =====

/**
 * Check if any filter is currently active.
 */
export const selectHasActiveFilters = (state: DashboardStore) =>
  state.stateFilter.enabled ||
  state.partyFilter.enabled ||
  state.voteRangeFilter.enabled ||
  state.turnoutFilter.enabled ||
  state.marginPercentageFilter.enabled ||
  state.totalVotesFilter.enabled ||
  state.winnerVotesFilter.enabled;

/**
 * Get a summary of active filters.
 */
export const selectActiveFiltersSummary = (state: DashboardStore) => ({
  stateCount: state.stateFilter.stateCodes.size,
  partyCount: state.partyFilter.partyNames.size,
  isVoteRangeActive: state.voteRangeFilter.enabled,
  isTurnoutActive: state.turnoutFilter.enabled,
  isMarginPercentageActive: state.marginPercentageFilter.enabled,
  isTotalVotesActive: state.totalVotesFilter.enabled,
  isWinnerVotesActive: state.winnerVotesFilter.enabled,
  totalActiveFilters:
    (state.stateFilter.stateCodes.size > 0 ? 1 : 0) +
    (state.partyFilter.partyNames.size > 0 ? 1 : 0) +
    (state.voteRangeFilter.enabled ? 1 : 0) +
    (state.turnoutFilter.enabled ? 1 : 0) +
    (state.marginPercentageFilter.enabled ? 1 : 0) +
    (state.totalVotesFilter.enabled ? 1 : 0) +
    (state.winnerVotesFilter.enabled ? 1 : 0),
});

/**
 * Get all filters as a serializable object.
 * Useful for saving/restoring filter state or debugging.
 */
type FiltersSnapshot = {
  state: {
    stateCodes: string[];
    stateNames: string[];
    enabled: boolean;
  };
  party: {
    partyNames: string[];
    enabled: boolean;
  };
  voteRange: {
    min: number;
    max: number;
    enabled: boolean;
  };
  turnout: {
    min: number;
    max: number;
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
};

let lastFiltersSnapshot: FiltersSnapshot | null = null;
let lastFiltersSnapshotRefs: {
  stateFilter: DashboardStore["stateFilter"];
  partyFilter: DashboardStore["partyFilter"];
  voteRangeFilter: DashboardStore["voteRangeFilter"];
  turnoutFilter: DashboardStore["turnoutFilter"];
  marginPercentageFilter: DashboardStore["marginPercentageFilter"];
  totalVotesFilter: DashboardStore["totalVotesFilter"];
  winnerVotesFilter: DashboardStore["winnerVotesFilter"];
} | null = null;

export const selectFiltersSnapshot = (state: DashboardStore): FiltersSnapshot => {
  const refs = {
    stateFilter: state.stateFilter,
    partyFilter: state.partyFilter,
    voteRangeFilter: state.voteRangeFilter,
    turnoutFilter: state.turnoutFilter,
    marginPercentageFilter: state.marginPercentageFilter,
    totalVotesFilter: state.totalVotesFilter,
    winnerVotesFilter: state.winnerVotesFilter,
  };

  if (
    lastFiltersSnapshotRefs &&
    lastFiltersSnapshotRefs.stateFilter === refs.stateFilter &&
    lastFiltersSnapshotRefs.partyFilter === refs.partyFilter &&
    lastFiltersSnapshotRefs.voteRangeFilter === refs.voteRangeFilter &&
    lastFiltersSnapshotRefs.turnoutFilter === refs.turnoutFilter &&
    lastFiltersSnapshotRefs.marginPercentageFilter === refs.marginPercentageFilter &&
    lastFiltersSnapshotRefs.totalVotesFilter === refs.totalVotesFilter &&
    lastFiltersSnapshotRefs.winnerVotesFilter === refs.winnerVotesFilter
  ) {
    return lastFiltersSnapshot!;
  }

  lastFiltersSnapshotRefs = refs;
  lastFiltersSnapshot = {
    state: {
      stateCodes: Array.from(state.stateFilter.stateCodes),
      stateNames: Array.from(state.stateFilter.stateNames),
      enabled: state.stateFilter.enabled,
    },
    party: {
      partyNames: Array.from(state.partyFilter.partyNames),
      enabled: state.partyFilter.enabled,
    },
    voteRange: {
      min: state.voteRangeFilter.min,
      max: state.voteRangeFilter.max,
      enabled: state.voteRangeFilter.enabled,
    },
    turnout: {
      min: state.turnoutFilter.min,
      max: state.turnoutFilter.max,
      enabled: state.turnoutFilter.enabled,
    },
    marginPercentage: {
      min: state.marginPercentageFilter.min,
      max: state.marginPercentageFilter.max,
      enabled: state.marginPercentageFilter.enabled,
    },
    totalVotes: {
      min: state.totalVotesFilter.min,
      max: state.totalVotesFilter.max,
      enabled: state.totalVotesFilter.enabled,
    },
    winnerVotes: {
      min: state.winnerVotesFilter.min,
      max: state.winnerVotesFilter.max,
      enabled: state.winnerVotesFilter.enabled,
    },
  };

  return lastFiltersSnapshot;
};

// ===== UI State Selectors =====

export const selectIsFilterPanelOpen = (state: DashboardStore) => state.isFilterPanelOpen;

export const selectIsAnalyticsPanelOpen = (state: DashboardStore) => state.isAnalyticsPanelOpen;

export const selectActiveAnalyticsTab = (state: DashboardStore) => state.activeAnalyticsTab;

// ===== Combined State Selectors =====

/**
 * Get complete dashboard state snapshot.
 * Use sparingly - prefer specific selectors for better performance.
 */
export const selectDashboardState = (state: DashboardStore) => state;

/**
 * Get only the UI-related state.
 */
export const selectUIState = (state: DashboardStore) => ({
  isFilterPanelOpen: state.isFilterPanelOpen,
  isAnalyticsPanelOpen: state.isAnalyticsPanelOpen,
  activeAnalyticsTab: state.activeAnalyticsTab,
});

/**
 * Get only the filter-related state.
 */
type AllFiltersState = {
  stateFilter: DashboardStore["stateFilter"];
  partyFilter: DashboardStore["partyFilter"];
  voteRangeFilter: DashboardStore["voteRangeFilter"];
  turnoutFilter: DashboardStore["turnoutFilter"];
  marginPercentageFilter: DashboardStore["marginPercentageFilter"];
  totalVotesFilter: DashboardStore["totalVotesFilter"];
  winnerVotesFilter: DashboardStore["winnerVotesFilter"];
};

let lastAllFiltersResult: AllFiltersState | null = null;
let lastAllFiltersRefs: AllFiltersState | null = null;

export const selectAllFilters = (state: DashboardStore): AllFiltersState => {
  const refs: AllFiltersState = {
    stateFilter: state.stateFilter,
    partyFilter: state.partyFilter,
    voteRangeFilter: state.voteRangeFilter,
    turnoutFilter: state.turnoutFilter,
    marginPercentageFilter: state.marginPercentageFilter,
    totalVotesFilter: state.totalVotesFilter,
    winnerVotesFilter: state.winnerVotesFilter,
  };

  if (
    lastAllFiltersRefs &&
    lastAllFiltersRefs.stateFilter === refs.stateFilter &&
    lastAllFiltersRefs.partyFilter === refs.partyFilter &&
    lastAllFiltersRefs.voteRangeFilter === refs.voteRangeFilter &&
    lastAllFiltersRefs.turnoutFilter === refs.turnoutFilter &&
    lastAllFiltersRefs.marginPercentageFilter === refs.marginPercentageFilter &&
    lastAllFiltersRefs.totalVotesFilter === refs.totalVotesFilter &&
    lastAllFiltersRefs.winnerVotesFilter === refs.winnerVotesFilter
  ) {
    return lastAllFiltersResult!;
  }

  lastAllFiltersRefs = refs;
  lastAllFiltersResult = {
    stateFilter: state.stateFilter,
    partyFilter: state.partyFilter,
    voteRangeFilter: state.voteRangeFilter,
    turnoutFilter: state.turnoutFilter,
    marginPercentageFilter: state.marginPercentageFilter,
    totalVotesFilter: state.totalVotesFilter,
    winnerVotesFilter: state.winnerVotesFilter,
  };

  return lastAllFiltersResult;
};

/**
 * Get only the map-related state.
 */
export const selectMapState = (state: DashboardStore) => ({
  hoveredFeature: state.hoveredFeature,
  selectedFeature: state.selectedFeature,
  activeRegionMetadata: state.activeRegionMetadata,
  mapInteraction: state.mapInteraction,
  constituencySelection: state.constituencySelection,
});

/**
 * Get only the visualization-related state.
 */
export const selectVisualizationState = (state: DashboardStore) => ({
  choroplethMode: state.choroplethMode,
  metricConfig: state.metricConfig,
  selectedMetricDescriptor: state.metricConfig[state.choroplethMode.selectedMetricKey] ?? null,
});
