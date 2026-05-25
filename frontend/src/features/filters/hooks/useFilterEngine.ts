/**
 * React hooks for filter management and integration.
 *
 * Provides:
 * - useFilterEngine: Main filtering hook with metrics loading
 * - useFilterState: Direct filter state management
 * - useFilteredFeatures: Filtered features with memoization
 * - useFilteredGeoJSON: Filtered GeoJSON collection
 */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { loadElectionMetrics, getElectionMetrics, type ElectionMetricsIndex } from "@/services/election-metrics.service";
import { useDashboardStore, selectAllFilters } from "@/store";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@/types/geojson";
import {
  applyFilters,
  applyFiltersWithBreakdown,
  createFilterSnapshot,
  getActiveFilterDescriptions,
  hasActiveFilters,
  mergeFilters,
  extractGeoJSONMetadataKey,
  createFilterPredicate,
  mapDashboardFiltersToEngineConfig,
} from "../utils/filter-engine";
import type {
  FilterConfig,
  FilterResult,
  DetailedFilterResult,
  FilterStatus,
} from "../types/filter.types";

/**
 * Main hook for filtering GeoJSON features based on dashboard filters.
 *
 * Handles:
 * - Loading election metrics
 * - Applying filters from dashboard store
 * - Memoizing results for performance
 * - Providing detailed statistics
 */
export function useFilterEngine(features: GeoJSONFeature<Record<string, unknown>>[] | null) {
  const [metricsIndex, setMetricsIndex] = useState<ElectionMetricsIndex | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<Error | null>(null);

  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(
    () => mapDashboardFiltersToEngineConfig(filters),
    [filters],
  );

  // Load election metrics on mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        const metrics = await loadElectionMetrics();
        setMetricsIndex(metrics);
        setMetricsError(null);
      } catch (error) {
        setMetricsError(error instanceof Error ? error : new Error("Failed to load metrics"));
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadMetrics();
  }, []);

  // Apply filters to features
  const filterResult = useMemo<FilterResult | null>(() => {
    if (!features || !metricsIndex) return null;
    return applyFilters(features, engineFilters, metricsIndex);
  }, [features, engineFilters, metricsIndex]);

  // Get filter status
  const filterStatus = useMemo<FilterStatus>(() => {
    const descriptions = getActiveFilterDescriptions(engineFilters);

    return {
      isFiltered: hasActiveFilters(engineFilters),
      activeFilterCount: [
        engineFilters.party.enabled && engineFilters.party.values.size > 0 ? 1 : 0,
        engineFilters.state.enabled && engineFilters.state.values.size > 0 ? 1 : 0,
        engineFilters.marginPercentage.enabled ? 1 : 0,
        engineFilters.totalVotes.enabled ? 1 : 0,
        engineFilters.winnerVotes.enabled ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
      matchedPercentage: filterResult ? (filterResult.statistics.matchedFeatures / filterResult.statistics.totalFeatures) * 100 : 100,
      appliedFilters: descriptions.map((description) => ({
        name: description,
        description,
      })),
    };
  }, [engineFilters, filterResult]);

  return {
    filteredFeatures: filterResult?.passedFeatures ?? null,
    filterResult,
    filterStatus,
    metricsIndex,
    isLoadingMetrics,
    metricsError,
  };
}

/**
 * Hook for detailed filter analysis with breakdown by filter type.
 * Use when you need comprehensive filter statistics.
 */
export function useDetailedFilterEngine(features: GeoJSONFeature<Record<string, unknown>>[] | null) {
  const [metricsIndex, setMetricsIndex] = useState<ElectionMetricsIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(() => mapDashboardFiltersToEngineConfig(filters), [filters]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await loadElectionMetrics();
        setMetricsIndex(metrics);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const detailedResult = useMemo<DetailedFilterResult | null>(() => {
    if (!features || !metricsIndex) return null;
    return applyFiltersWithBreakdown(features, engineFilters, metricsIndex);
  }, [features, engineFilters, metricsIndex]);

  return {
    detailedResult,
    metricsIndex,
    isLoading,
    filterBreakdown: detailedResult?.filterBreakdown ?? null,
  };
}

/**
 * Hook for getting filtered GeoJSON feature collection.
 * Automatically syncs with dashboard filters and returns complete GeoJSON structure.
 */
export function useFilteredGeoJSON(
  geoJSON: GeoJSONFeatureCollection<Record<string, unknown>> | null,
): GeoJSONFeatureCollection<Record<string, unknown>> | null {
  const { filteredFeatures } = useFilterEngine(geoJSON?.features ?? null);

  return useMemo(() => {
    if (!geoJSON || !filteredFeatures) return null;

    return {
      type: "FeatureCollection",
      features: filteredFeatures,
      bbox: geoJSON.bbox,
      metadata: geoJSON.metadata,
    };
  }, [geoJSON, filteredFeatures]);
}

/**
 * Hook for manually managing filter state (advanced use case).
 * Provides low-level control over filter application.
 */
export function useFilterState(initialFilters: Partial<FilterConfig> = {}) {
  const defaultFilters = useMemo<FilterConfig>(() => ({
    party: { type: "set", values: new Set(), enabled: false },
    state: { type: "set", values: new Set(), enabled: false },
    marginPercentage: { type: "range", min: 0, max: 100, enabled: false },
    totalVotes: { type: "range", min: 0, max: 10000000, enabled: false },
    winnerVotes: { type: "range", min: 0, max: 10000000, enabled: false },
  }), []);

  const [filters, setFilters] = useState<FilterConfig>(mergeFilters(defaultFilters, initialFilters));

  const updatePartyFilter = useCallback((parties: Set<string>, enabled: boolean) => {
    setFilters((prev: FilterConfig) => ({
      ...prev,
      party: { type: "set", values: parties, enabled },
    }));
  }, []);

  const updateStateFilter = useCallback((states: Set<string>, enabled: boolean) => {
    setFilters((prev: FilterConfig) => ({
      ...prev,
      state: { type: "set", values: states, enabled },
    }));
  }, []);

  const updateMarginFilter = useCallback((min: number, max: number, enabled: boolean) => {
    setFilters((prev: FilterConfig) => ({
      ...prev,
      marginPercentage: { type: "range", min, max, enabled },
    }));
  }, []);

  const updateTotalVotesFilter = useCallback((min: number, max: number, enabled: boolean) => {
    setFilters((prev: FilterConfig) => ({
      ...prev,
      totalVotes: { type: "range", min, max, enabled },
    }));
  }, []);

  const updateWinnerVotesFilter = useCallback((min: number, max: number, enabled: boolean) => {
    setFilters((prev: FilterConfig) => ({
      ...prev,
      winnerVotes: { type: "range", min, max, enabled },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  return {
    filters,
    updatePartyFilter,
    updateStateFilter,
    updateMarginFilter,
    updateTotalVotesFilter,
    updateWinnerVotesFilter,
    resetFilters,
  };
}

/**
 * Hook to check if a specific feature passes the current filters.
 * Useful for conditional rendering in feature components.
 */
export function useFeatureFilter(
  feature: GeoJSONFeature<Record<string, unknown>> | null,
  metricsIndex: ElectionMetricsIndex | null,
) {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(
    () => mapDashboardFiltersToEngineConfig(filters),
    [filters],
  );

  return useMemo(() => {
    if (!feature || !metricsIndex) return true;

    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    const predicate = createFilterPredicate(engineFilters);
    return predicate(feature, metrics);
  }, [feature, metricsIndex, engineFilters]);
}

/**
 * Hook to get filter state snapshot for debugging.
 */
export function useFilterSnapshot() {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(
    () => mapDashboardFiltersToEngineConfig(filters),
    [filters],
  );

  return useMemo(() => createFilterSnapshot(engineFilters), [engineFilters]);
}

/**
 * Hook to get readable descriptions of active filters.
 */
export function useFilterDescriptions() {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(
    () => mapDashboardFiltersToEngineConfig(filters),
    [filters],
  );

  return useMemo(() => getActiveFilterDescriptions(engineFilters), [engineFilters]);
}
