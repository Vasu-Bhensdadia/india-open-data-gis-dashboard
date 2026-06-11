"use client";

import { useEffect, useMemo, useState } from "react";

import type { LatLngBoundsTuple } from "@/features/maps/utils/map-bounds";
import { loadElectionMetrics, type ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

import { buildElectionSearchIndex } from "../utils/search-index";
import { loadStateBoundaryIndex } from "../utils/state-boundaries";
import type { ElectionSearchIndex } from "../types/search.types";

export interface UseElectionSearchIndexResult {
  index: ElectionSearchIndex | null;
  metricsIndex: ElectionMetricsIndex | null;
  isLoading: boolean;
  error: Error | null;
}

export function useElectionSearchIndex(
  features: GeoJSONFeature<Record<string, unknown>>[] | null,
): UseElectionSearchIndexResult {
  const [metricsIndex, setMetricsIndex] = useState<ElectionMetricsIndex | null>(null);
  const [stateBoundaryByKey, setStateBoundaryByKey] = useState<Map<string, LatLngBoundsTuple>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [metrics, stateBoundaries] = await Promise.all([
          loadElectionMetrics(),
          loadStateBoundaryIndex(),
        ]);

        if (!cancelled) {
          setMetricsIndex(metrics);
          setStateBoundaryByKey(stateBoundaries);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error("Failed to load election data"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const index = useMemo(() => {
    if (!metricsIndex) {
      return null;
    }

    return buildElectionSearchIndex(metricsIndex, features, stateBoundaryByKey);
  }, [metricsIndex, features, stateBoundaryByKey]);

  return {
    index,
    metricsIndex,
    isLoading,
    error,
  };
}
