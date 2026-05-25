/**
 * Centralized dashboard state type definitions.
 *
 * This module defines the complete state shape for the GIS dashboard,
 * combining map interactions, filters, and analytics controls.
 */

import type { GeoJSONFeature } from "@/types/geojson";
import type { ChoroplethMetricKey, ChoroplethMetricDescriptor } from "@/features/maps/types/choropleth";
import type { MapViewLevel, MapInteractionMode, MapRegionMetadata } from "@/features/maps/map.store";

/**
 * Range filter state for numeric values.
 */
export interface RangeFilter {
  min: number;
  max: number;
  enabled: boolean;
}

/**
 * Selected state filters.
 */
export interface StateFilter {
  stateCodes: Set<string>;
  stateNames: Set<string>;
  enabled: boolean;
}

/**
 * Selected party filters.
 */
export interface PartyFilter {
  partyNames: Set<string>;
  enabled: boolean;
}

/**
 * Vote range filter (votes per candidate).
 */
export interface VoteRangeFilter extends RangeFilter {
  // votes in thousands for display purposes
  step?: number;
}

/**
 * Winner margin percentage filter.
 */
export interface MarginPercentageFilter extends RangeFilter {
  // percentage 0-100
  step?: number;
}

/**
 * Total votes filter.
 */
export interface TotalVotesFilter extends RangeFilter {
  step?: number;
}

/**
 * Winner vote count filter.
 */
export interface WinnerVotesFilter extends RangeFilter {
  step?: number;
}

/**
 * Turnout percentage filter.
 */
export interface TurnoutFilter extends RangeFilter {
  // percentage 0-100
  step?: number;
}

/**
 * Map interaction state.
 */
export interface MapInteractionState {
  mode: MapInteractionMode;
  isDragging: boolean;
  isResettingView: boolean;
  lastInteractedFeatureId: string | null;
  viewLevel: MapViewLevel;
}

/**
 * Choropleth visualization mode settings.
 */
export interface ChoroplethMode {
  selectedMetricKey: ChoroplethMetricKey;
  isConfigLoaded: boolean;
}

/**
 * Constituency selection state.
 */
export interface ConstituencySelection {
  selectedConstituencyId: string | null;
  selectedConstituencyName: string | null;
  hoveredConstituencyId: string | null;
  hoveredConstituencyName: string | null;
}

/**
 * Complete dashboard state.
 */
export interface DashboardState {
  // ===== Constituency Selection =====
  constituencySelection: ConstituencySelection;

  // ===== Map Interactions =====
  hoveredFeature: GeoJSONFeature<Record<string, unknown>> | null;
  selectedFeature: GeoJSONFeature<Record<string, unknown>> | null;
  activeRegionMetadata: MapRegionMetadata | null;
  mapInteraction: MapInteractionState;

  // ===== Choropleth Visualization =====
  choroplethMode: ChoroplethMode;
  metricConfig: Partial<Record<ChoroplethMetricKey, ChoroplethMetricDescriptor<Record<string, unknown>>>>;

  // ===== Filters =====
  stateFilter: StateFilter;
  partyFilter: PartyFilter;
  voteRangeFilter: VoteRangeFilter;
  turnoutFilter: TurnoutFilter;
  marginPercentageFilter: MarginPercentageFilter;
  totalVotesFilter: TotalVotesFilter;
  winnerVotesFilter: WinnerVotesFilter;

  // ===== UI State =====
  isFilterPanelOpen: boolean;
  isAnalyticsPanelOpen: boolean;
  activeAnalyticsTab: string | null;
}

/**
 * Default/initial state values.
 */
export const DEFAULT_DASHBOARD_STATE: DashboardState = {
  constituencySelection: {
    selectedConstituencyId: null,
    selectedConstituencyName: null,
    hoveredConstituencyId: null,
    hoveredConstituencyName: null,
  },
  hoveredFeature: null,
  selectedFeature: null,
  activeRegionMetadata: null,
  mapInteraction: {
    mode: "idle",
    isDragging: false,
    isResettingView: false,
    lastInteractedFeatureId: null,
    viewLevel: "country",
  },
  choroplethMode: {
    selectedMetricKey: "boundaryOnly",
    isConfigLoaded: false,
  },
  metricConfig: {},
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
  isFilterPanelOpen: false,
  isAnalyticsPanelOpen: true,
  activeAnalyticsTab: null,
};
