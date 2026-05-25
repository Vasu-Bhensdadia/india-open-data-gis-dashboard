/**
 * Centralized GIS dashboard Zustand store.
 *
 * This store manages all dashboard state including:
 * - Map interactions (hover, select, zoom)
 * - Constituency selection
 * - Choropleth visualization mode
 * - All filters (state, party, vote range, turnout)
 * - UI state (panel visibility, active tabs)
 *
 * Design principles:
 * - Single source of truth for dashboard state
 * - Avoid prop drilling between dashboard components
 * - Enable independent component updates
 * - Support future analytics and charts
 * - Maintain backward compatibility with existing map interactions
 */

import { create } from "zustand";
import type { GeoJSONFeature } from "@/types/geojson";
import type { ChoroplethMetricKey, ChoroplethMetricDescriptor } from "@/features/maps/types/choropleth";
import type { MapRegionMetadata } from "@/features/maps/map.store";
import type {
  DashboardState,
  MapInteractionState,
  StateFilter,
  PartyFilter,
  VoteRangeFilter,
  TurnoutFilter,
  MarginPercentageFilter,
  TotalVotesFilter,
  WinnerVotesFilter,
  ChoroplethMode,
} from "./dashboard.types";
import { DEFAULT_DASHBOARD_STATE } from "./dashboard.types";

/**
 * Actions for the dashboard store.
 */
export interface DashboardActions {
  // ===== Constituency Selection Actions =====
  /**
   * Select a constituency from the map.
   * Updates both constituency selection and map interaction state.
   */
  selectConstituency: (
    constituencyId: string,
    constituencyName: string,
    feature: GeoJSONFeature<Record<string, unknown>> | null,
    metadata?: Partial<MapRegionMetadata>,
  ) => void;

  /**
   * Deselect the currently selected constituency.
   */
  deselectConstituency: () => void;

  /**
   * Set hover state for a constituency.
   * Used for visual feedback during map interaction.
   */
  hoverConstituency: (
    constituencyId: string | null,
    constituencyName: string | null,
    feature?: GeoJSONFeature<Record<string, unknown>> | null,
    metadata?: Partial<MapRegionMetadata>,
  ) => void;

  // ===== Map Interaction Actions =====
  /**
   * Update map interaction state (mode, dragging, etc.)
   */
  updateMapInteraction: (partial: Partial<MapInteractionState>) => void;

  /**
   * Reset all map interactions to idle state.
   */
  resetMapInteraction: () => void;

  /**
   * Update active region metadata.
   */
  setActiveRegionMetadata: (metadata: MapRegionMetadata | null) => void;

  // ===== Choropleth Mode Actions =====
  /**
   * Change the active metric for choropleth visualization.
   * @param metricKey - The metric key to activate
   */
  setChoroplethMetric: (metricKey: ChoroplethMetricKey) => void;

  /**
   * Update choropleth mode state.
   */
  setChoroplethMode: (mode: Partial<ChoroplethMode>) => void;

  /**
   * Set metric configuration (usually loaded from service).
   */
  setMetricConfig: (config: Record<ChoroplethMetricKey, ChoroplethMetricDescriptor<Record<string, unknown>>>) => void;

  // ===== Filter Actions - State Filter =====
  /**
   * Toggle a state in the filter.
   * @param stateCode - State code to toggle
   * @param stateName - State name to toggle
   */
  toggleStateFilter: (stateCode: string, stateName: string) => void;

  /**
   * Clear all state filters.
   */
  clearStateFilter: () => void;

  /**
   * Enable or disable the state filter.
   */
  setStateFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire state filter.
   */
  setStateFilter: (filter: Partial<StateFilter>) => void;

  // ===== Filter Actions - Party Filter =====
  /**
   * Toggle a party in the filter.
   * @param partyName - Party name to toggle
   */
  togglePartyFilter: (partyName: string) => void;

  /**
   * Clear all party filters.
   */
  clearPartyFilter: () => void;

  /**
   * Enable or disable the party filter.
   */
  setPartyFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire party filter.
   */
  setPartyFilter: (filter: Partial<PartyFilter>) => void;

  // ===== Filter Actions - Vote Range Filter =====
  /**
   * Set vote range filter bounds.
   * @param min - Minimum votes
   * @param max - Maximum votes
   */
  setVoteRange: (min: number, max: number) => void;

  /**
   * Enable or disable the vote range filter.
   */
  setVoteRangeFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire vote range filter.
   */
  setVoteRangeFilter: (filter: Partial<VoteRangeFilter>) => void;

  // ===== Filter Actions - Margin Percentage Filter =====
  /**
   * Set winner margin percentage filter bounds.
   * @param min - Minimum margin percentage
   * @param max - Maximum margin percentage
   */
  setMarginRange: (min: number, max: number) => void;

  /**
   * Enable or disable the margin percentage filter.
   */
  setMarginFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire margin percentage filter.
   */
  setMarginPercentageFilter: (filter: Partial<MarginPercentageFilter>) => void;

  // ===== Filter Actions - Total Votes Filter =====
  /**
   * Set total votes filter bounds.
   * @param min - Minimum total votes
   * @param max - Maximum total votes
   */
  setTotalVotesRange: (min: number, max: number) => void;

  /**
   * Enable or disable the total votes filter.
   */
  setTotalVotesFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire total votes filter.
   */
  setTotalVotesFilter: (filter: Partial<TotalVotesFilter>) => void;

  // ===== Filter Actions - Winner Votes Filter =====
  /**
   * Set winner votes filter bounds.
   * @param min - Minimum winner votes
   * @param max - Maximum winner votes
   */
  setWinnerVotesRange: (min: number, max: number) => void;

  /**
   * Enable or disable the winner votes filter.
   */
  setWinnerVotesFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire winner votes filter.
   */
  setWinnerVotesFilter: (filter: Partial<WinnerVotesFilter>) => void;

  // ===== Turnout Filter Actions =====
  /**
   * Set turnout percentage filter bounds.
   * @param min - Minimum turnout percentage (0-100)
   * @param max - Maximum turnout percentage (0-100)
   */
  setTurnoutRange: (min: number, max: number) => void;

  /**
   * Enable or disable the turnout filter.
   */
  setTurnoutFilterEnabled: (enabled: boolean) => void;

  /**
   * Replace entire turnout filter.
   */
  setTurnoutFilter: (filter: Partial<TurnoutFilter>) => void;

  // ===== Batch Filter Actions =====
  /**
   * Reset all filters to default state.
   */
  resetAllFilters: () => void;

  /**
   * Apply all active filters (useful for analytics calculations).
   */
  applyFilters: () => void;

  // ===== UI State Actions =====
  /**
   * Toggle filter panel visibility.
   */
  toggleFilterPanel: () => void;

  /**
   * Toggle analytics panel visibility.
   */
  toggleAnalyticsPanel: () => void;

  /**
   * Set active analytics tab.
   */
  setActiveAnalyticsTab: (tabId: string | null) => void;

  // ===== State Reset =====
  /**
   * Reset entire dashboard to initial state.
   */
  resetDashboard: () => void;
}

/**
 * Complete dashboard store type.
 */
export type DashboardStore = DashboardState & DashboardActions;

/**
 * Create the centralized dashboard store.
 * Integrates map interactions, filters, and analytics state.
 */
export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  // Initial state
  ...DEFAULT_DASHBOARD_STATE,

  // ===== Constituency Selection Actions =====
  selectConstituency: (constituencyId, constituencyName, feature, metadata) =>
    set((state) => ({
      constituencySelection: {
        ...state.constituencySelection,
        selectedConstituencyId: constituencyId,
        selectedConstituencyName: constituencyName,
      },
      selectedFeature: feature,
      activeRegionMetadata: metadata
        ? {
            featureId: metadata.featureId ?? state.activeRegionMetadata?.featureId ?? constituencyId,
            regionName: metadata.regionName ?? state.activeRegionMetadata?.regionName ?? constituencyName,
            regionCode: metadata.regionCode ?? state.activeRegionMetadata?.regionCode,
            level: metadata.level ?? state.activeRegionMetadata?.level ?? "constituency",
            parentRegionId: metadata.parentRegionId ?? state.activeRegionMetadata?.parentRegionId,
            properties: {
              ...(state.activeRegionMetadata?.properties ?? {}),
              ...(metadata.properties ?? {}),
            },
          }
        : state.activeRegionMetadata,
      mapInteraction: {
        ...state.mapInteraction,
        mode: "select",
        lastInteractedFeatureId: constituencyId,
      },
    })),

  deselectConstituency: () =>
    set((state) => ({
      constituencySelection: {
        ...state.constituencySelection,
        selectedConstituencyId: null,
        selectedConstituencyName: null,
      },
      selectedFeature: null,
      mapInteraction: {
        ...state.mapInteraction,
        mode: "idle",
      },
    })),

  hoverConstituency: (constituencyId, constituencyName, feature, metadata) =>
    set((state) => ({
      constituencySelection: {
        ...state.constituencySelection,
        hoveredConstituencyId: constituencyId,
        hoveredConstituencyName: constituencyName,
      },
      hoveredFeature: feature ?? null,
      activeRegionMetadata: metadata
        ? {
            featureId: metadata.featureId ?? state.activeRegionMetadata?.featureId ?? constituencyId ?? "",
            regionName: metadata.regionName ?? state.activeRegionMetadata?.regionName ?? constituencyName ?? "Unknown",
            regionCode: metadata.regionCode ?? state.activeRegionMetadata?.regionCode,
            level: metadata.level ?? state.activeRegionMetadata?.level ?? "constituency",
            parentRegionId: metadata.parentRegionId ?? state.activeRegionMetadata?.parentRegionId,
            properties: {
              ...(state.activeRegionMetadata?.properties ?? {}),
              ...(metadata.properties ?? {}),
            },
          }
        : state.activeRegionMetadata,
      mapInteraction: {
        ...state.mapInteraction,
        mode: constituencyId ? "hover" : state.mapInteraction.mode,
        lastInteractedFeatureId: constituencyId ?? state.mapInteraction.lastInteractedFeatureId,
      },
    })),

  // ===== Map Interaction Actions =====
  updateMapInteraction: (partial) =>
    set((state) => ({
      mapInteraction: {
        ...state.mapInteraction,
        ...partial,
      },
    })),

  resetMapInteraction: () =>
    set((state) => ({
      mapInteraction: {
        mode: "idle",
        isDragging: false,
        isResettingView: false,
        lastInteractedFeatureId: null,
        viewLevel: state.mapInteraction.viewLevel, // Preserve view level
      },
      constituencySelection: {
        selectedConstituencyId: null,
        selectedConstituencyName: null,
        hoveredConstituencyId: null,
        hoveredConstituencyName: null,
      },
      hoveredFeature: null,
      selectedFeature: null,
    })),

  setActiveRegionMetadata: (metadata) =>
    set((state) => ({
      activeRegionMetadata: metadata,
      mapInteraction: {
        ...state.mapInteraction,
        lastInteractedFeatureId: metadata?.featureId ?? state.mapInteraction.lastInteractedFeatureId,
      },
    })),

  // ===== Choropleth Mode Actions =====
  setChoroplethMetric: (metricKey) =>
    set((state) => ({
      choroplethMode: {
        ...state.choroplethMode,
        selectedMetricKey: metricKey,
      },
    })),

  setChoroplethMode: (mode) =>
    set((state) => ({
      choroplethMode: {
        ...state.choroplethMode,
        ...mode,
      },
    })),

  setMetricConfig: (config) =>
    set({
      metricConfig: config,
      choroplethMode: {
        selectedMetricKey: "boundaryOnly",
        isConfigLoaded: true,
      },
    }),

  // ===== State Filter Actions =====
  toggleStateFilter: (stateCode, stateName) =>
    set((state) => {
      const newStateCodes = new Set(state.stateFilter.stateCodes);
      const newStateNames = new Set(state.stateFilter.stateNames);

      if (newStateCodes.has(stateCode)) {
        newStateCodes.delete(stateCode);
        newStateNames.delete(stateName);
      } else {
        newStateCodes.add(stateCode);
        newStateNames.add(stateName);
      }

      return {
        stateFilter: {
          ...state.stateFilter,
          stateCodes: newStateCodes,
          stateNames: newStateNames,
          enabled: newStateCodes.size > 0,
        },
      };
    }),

  clearStateFilter: () =>
    set({
      stateFilter: {
        stateCodes: new Set(),
        stateNames: new Set(),
        enabled: false,
      },
    }),

  setStateFilterEnabled: (enabled) =>
    set((state) => ({
      stateFilter: {
        ...state.stateFilter,
        enabled,
      },
    })),

  setStateFilter: (filter) =>
    set((state) => ({
      stateFilter: {
        ...state.stateFilter,
        ...filter,
      },
    })),

  // ===== Party Filter Actions =====
  togglePartyFilter: (partyName) =>
    set((state) => {
      const newPartyNames = new Set(state.partyFilter.partyNames);

      if (newPartyNames.has(partyName)) {
        newPartyNames.delete(partyName);
      } else {
        newPartyNames.add(partyName);
      }

      return {
        partyFilter: {
          ...state.partyFilter,
          partyNames: newPartyNames,
          enabled: newPartyNames.size > 0,
        },
      };
    }),

  clearPartyFilter: () =>
    set({
      partyFilter: {
        partyNames: new Set(),
        enabled: false,
      },
    }),

  setPartyFilterEnabled: (enabled) =>
    set((state) => ({
      partyFilter: {
        ...state.partyFilter,
        enabled,
      },
    })),

  setPartyFilter: (filter) =>
    set((state) => ({
      partyFilter: {
        ...state.partyFilter,
        ...filter,
      },
    })),

  // ===== Vote Range Filter Actions =====
  setVoteRange: (min, max) =>
    set((state) => ({
      voteRangeFilter: {
        ...state.voteRangeFilter,
        min,
        max,
        enabled: true,
      },
    })),

  setVoteRangeFilterEnabled: (enabled) =>
    set((state) => ({
      voteRangeFilter: {
        ...state.voteRangeFilter,
        enabled,
      },
    })),

  setVoteRangeFilter: (filter) =>
    set((state) => ({
      voteRangeFilter: {
        ...state.voteRangeFilter,
        ...filter,
      },
    })),

  // ===== Margin Percentage Filter Actions =====
  setMarginRange: (min, max) =>
    set((state) => ({
      marginPercentageFilter: {
        ...state.marginPercentageFilter,
        min,
        max,
        enabled: true,
      },
    })),

  setMarginFilterEnabled: (enabled) =>
    set((state) => ({
      marginPercentageFilter: {
        ...state.marginPercentageFilter,
        enabled,
      },
    })),

  setMarginPercentageFilter: (filter) =>
    set((state) => ({
      marginPercentageFilter: {
        ...state.marginPercentageFilter,
        ...filter,
      },
    })),

  // ===== Total Votes Filter Actions =====
  setTotalVotesRange: (min, max) =>
    set((state) => ({
      totalVotesFilter: {
        ...state.totalVotesFilter,
        min,
        max,
        enabled: true,
      },
    })),

  setTotalVotesFilterEnabled: (enabled) =>
    set((state) => ({
      totalVotesFilter: {
        ...state.totalVotesFilter,
        enabled,
      },
    })),

  setTotalVotesFilter: (filter) =>
    set((state) => ({
      totalVotesFilter: {
        ...state.totalVotesFilter,
        ...filter,
      },
    })),

  // ===== Winner Votes Filter Actions =====
  setWinnerVotesRange: (min, max) =>
    set((state) => ({
      winnerVotesFilter: {
        ...state.winnerVotesFilter,
        min,
        max,
        enabled: true,
      },
    })),

  setWinnerVotesFilterEnabled: (enabled) =>
    set((state) => ({
      winnerVotesFilter: {
        ...state.winnerVotesFilter,
        enabled,
      },
    })),

  setWinnerVotesFilter: (filter) =>
    set((state) => ({
      winnerVotesFilter: {
        ...state.winnerVotesFilter,
        ...filter,
      },
    })),

  // ===== Turnout Filter Actions =====
  setTurnoutRange: (min, max) =>
    set((state) => ({
      turnoutFilter: {
        ...state.turnoutFilter,
        min,
        max,
        enabled: true,
      },
    })),

  setTurnoutFilterEnabled: (enabled) =>
    set((state) => ({
      turnoutFilter: {
        ...state.turnoutFilter,
        enabled,
      },
    })),

  setTurnoutFilter: (filter) =>
    set((state) => ({
      turnoutFilter: {
        ...state.turnoutFilter,
        ...filter,
      },
    })),

  // ===== Batch Filter Actions =====
  resetAllFilters: () =>
    set({
      stateFilter: {
        stateCodes: new Set(),
        stateNames: new Set(),
        enabled: false,
      },
      partyFilter: {
        partyNames: new Set(),
        enabled: false,
      },
      voteRangeFilter: {
        min: 0,
        max: 10000000,
        enabled: false,
        step: 100000,
      },
      turnoutFilter: {
        min: 0,
        max: 100,
        enabled: false,
        step: 5,
      },
      marginPercentageFilter: {
        min: 0,
        max: 100,
        enabled: false,
        step: 1,
      },
      totalVotesFilter: {
        min: 0,
        max: 10000000,
        enabled: false,
        step: 100000,
      },
      winnerVotesFilter: {
        min: 0,
        max: 10000000,
        enabled: false,
        step: 100000,
      },
    }),

  applyFilters: () => {
    // This action can be used to trigger analytics recalculation
    // Currently acts as a no-op, but reserved for future filter application logic
    const state = get();
    const hasActiveFilters =
      state.stateFilter.enabled ||
      state.partyFilter.enabled ||
      state.voteRangeFilter.enabled ||
      state.turnoutFilter.enabled ||
      state.marginPercentageFilter.enabled ||
      state.totalVotesFilter.enabled ||
      state.winnerVotesFilter.enabled;

    if (hasActiveFilters) {
      // Future: Trigger analytics panel update, GeoJSON filtering, etc.
      console.debug("Dashboard filters applied", {
        stateFilter: state.stateFilter.enabled,
        partyFilter: state.partyFilter.enabled,
        voteRangeFilter: state.voteRangeFilter.enabled,
        turnoutFilter: state.turnoutFilter.enabled,
        marginPercentageFilter: state.marginPercentageFilter.enabled,
        totalVotesFilter: state.totalVotesFilter.enabled,
        winnerVotesFilter: state.winnerVotesFilter.enabled,
      });
    }
  },

  // ===== UI State Actions =====
  toggleFilterPanel: () =>
    set((state) => ({
      isFilterPanelOpen: !state.isFilterPanelOpen,
    })),

  toggleAnalyticsPanel: () =>
    set((state) => ({
      isAnalyticsPanelOpen: !state.isAnalyticsPanelOpen,
    })),

  setActiveAnalyticsTab: (tabId) =>
    set({
      activeAnalyticsTab: tabId,
    }),

  // ===== State Reset =====
  resetDashboard: () =>
    set((state) => ({
      ...DEFAULT_DASHBOARD_STATE,
      mapInteraction: {
        ...DEFAULT_DASHBOARD_STATE.mapInteraction!,
        viewLevel: state.mapInteraction.viewLevel, // Preserve zoom level
      },
    })),
}));
