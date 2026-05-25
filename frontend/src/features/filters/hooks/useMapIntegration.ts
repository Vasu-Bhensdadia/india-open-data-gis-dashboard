/**
 * Integration utilities for filters with map rendering.
 *
 * Provides:
 * - Filter predicate creation for dynamic feature styling
 * - Map update callbacks
 * - Choropleth-aware filtering
 */

"use client";

import { useMemo } from "react";
import type { GeoJSONFeature } from "@/types/geojson";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import { getElectionMetrics } from "@/services/election-metrics.service";
import { useDashboardStore, selectAllFilters } from "@/store";
import {
  applyFilters,
  extractGeoJSONMetadataKey,
  mapDashboardFiltersToEngineConfig,
} from "../utils/filter-engine";
import type { FilterConfig, FilterResult } from "../types/filter.types";

/**
 * Hook that provides filtered GeoJSON features for map rendering.
 * Integrates with dashboard store and memoizes results.
 */
export function useMapFilteredFeatures(
  features: GeoJSONFeature<Record<string, unknown>>[] | null,
  metricsIndex: ElectionMetricsIndex | null,
) {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(() => mapDashboardFiltersToEngineConfig(filters), [filters]);

  const filterResult = useMemo<FilterResult | null>(() => {
    if (!features || !metricsIndex) return null;
    return applyFilters(features, engineFilters, metricsIndex);
  }, [features, engineFilters, metricsIndex]);

  return {
    visibleFeatures: filterResult?.passedFeatures ?? null,
    hiddenFeatures: filterResult?.filteredFeatures ?? null,
    filterResult,
    featureFilterMap: useMemo(() => {
      if (!filterResult) return new Map();

      const map = new Map<string | number | undefined, boolean>();
      for (const feature of filterResult.passedFeatures) {
        map.set(feature.id, true);
      }
      for (const feature of filterResult.filteredFeatures) {
        map.set(feature.id, false);
      }
      return map;
    }, [filterResult]),
  };
}

/**
 * Create a callback that checks if a feature should be visible on the map.
 * Useful for dynamic styling based on filter state.
 */
export function createFeatureVisibilityChecker(
  filters: FilterConfig,
  metricsIndex: ElectionMetricsIndex,
) {
  return (feature: GeoJSONFeature<Record<string, unknown>>): boolean => {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    // Apply each filter in sequence
    if (filters.party.enabled && filters.party.values.size > 0) {
      if (!metrics?.winner_party || !filters.party.values.has(metrics.winner_party)) {
        return false;
      }
    }

    if (filters.state.enabled && filters.state.values.size > 0) {
      if (!filters.state.values.has(stateName)) {
        return false;
      }
    }

    if (filters.marginPercentage.enabled) {
      if (
        !metrics?.winner_margin_percentage ||
        metrics.winner_margin_percentage < filters.marginPercentage.min ||
        metrics.winner_margin_percentage > filters.marginPercentage.max
      ) {
        return false;
      }
    }

    if (filters.totalVotes.enabled) {
      if (
        !metrics?.total_votes ||
        metrics.total_votes < filters.totalVotes.min ||
        metrics.total_votes > filters.totalVotes.max
      ) {
        return false;
      }
    }

    if (filters.winnerVotes.enabled) {
      if (
        !metrics?.winner_votes ||
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
 * Hook that provides opacity style for filtered vs visible features.
 * Highlights visible features and fades out filtered ones.
 */
export function useFilteredFeatureStyle(
  feature: GeoJSONFeature<Record<string, unknown>>,
  metricsIndex: ElectionMetricsIndex | null,
) {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(() => mapDashboardFiltersToEngineConfig(filters), [filters]);

  const isVisible = useMemo(() => {
    if (!metricsIndex) return true;

    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    // Check all filters
    if (engineFilters.party.enabled && engineFilters.party.values.size > 0) {
      if (!metrics?.winner_party || !engineFilters.party.values.has(metrics.winner_party)) {
        return false;
      }
    }

    if (engineFilters.state.enabled && engineFilters.state.values.size > 0) {
      if (!engineFilters.state.values.has(stateName)) {
        return false;
      }
    }

    if (engineFilters.marginPercentage.enabled) {
      if (
        !metrics?.winner_margin_percentage ||
        metrics.winner_margin_percentage < engineFilters.marginPercentage.min ||
        metrics.winner_margin_percentage > engineFilters.marginPercentage.max
      ) {
        return false;
      }
    }

    if (engineFilters.totalVotes.enabled) {
      if (
        !metrics?.total_votes ||
        metrics.total_votes < engineFilters.totalVotes.min ||
        metrics.total_votes > engineFilters.totalVotes.max
      ) {
        return false;
      }
    }

    if (engineFilters.winnerVotes.enabled) {
      if (
        !metrics?.winner_votes ||
        metrics.winner_votes < engineFilters.winnerVotes.min ||
        metrics.winner_votes > engineFilters.winnerVotes.max
      ) {
        return false;
      }
    }

    return true;
  }, [feature, metricsIndex, engineFilters]);

  return {
    isVisible,
    opacity: isVisible ? 1 : 0.15,
    pointerEvents: isVisible ? "auto" : "none",
  };
}

/**
 * Hook that provides color darkening for filtered features.
 * Creates visual feedback for filter application.
 */
export function useFilteredFeatureColor(
  baseColor: string,
  feature: GeoJSONFeature<Record<string, unknown>>,
  metricsIndex: ElectionMetricsIndex | null,
): string {
  const { isVisible } = useFilteredFeatureStyle(feature, metricsIndex);

  return useMemo(() => {
    if (isVisible) return baseColor;

    // Lighten the color for filtered-out features
    const hex = baseColor.replace(/^#/, "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Increase brightness by 40%
    const brightFactor = 1.4;
    const newR = Math.min(255, Math.floor(r * brightFactor));
    const newG = Math.min(255, Math.floor(g * brightFactor));
    const newB = Math.min(255, Math.floor(b * brightFactor));

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }, [isVisible, baseColor]);
}

/**
 * Hook that provides filter-aware selection state.
 * Prevents selecting filtered-out features.
 */
export function useFilterAwareSelection(
  feature: GeoJSONFeature<Record<string, unknown>>,
  metricsIndex: ElectionMetricsIndex | null,
) {
  const { isVisible } = useFilteredFeatureStyle(feature, metricsIndex);

  return {
    canBeSelected: isVisible,
    selectionOpacity: isVisible ? 1 : 0.5,
  };
}

/**
 * Hook that provides filter statistics for display.
 */
export function useFilterStatistics(
  features: GeoJSONFeature<Record<string, unknown>>[] | null,
  metricsIndex: ElectionMetricsIndex | null,
) {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = useMemo(() => mapDashboardFiltersToEngineConfig(filters), [filters]);

  const stats = useMemo(() => {
    if (!features || !metricsIndex) {
      return {
        totalFeatures: 0,
        visibleFeatures: 0,
        hiddenFeatures: 0,
        visibilityPercentage: 100,
      };
    }

    const result = applyFilters(features, engineFilters, metricsIndex);

    return {
      totalFeatures: result.statistics.totalFeatures,
      visibleFeatures: result.statistics.matchedFeatures,
      hiddenFeatures: result.statistics.filteredOutCount,
      visibilityPercentage: result.statistics.matchedFeatures
        ? (result.statistics.matchedFeatures / result.statistics.totalFeatures) * 100
        : 0,
    };
  }, [features, metricsIndex, engineFilters]);

  return stats;
}
