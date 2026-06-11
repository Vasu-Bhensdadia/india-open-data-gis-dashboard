"use client";

import { useCallback } from "react";

import { useDashboardFeatureSync } from "@/features/analytics/hooks/useDashboardFeatureSync";
import { useDashboardStore } from "@/store";

import { applySearchResult } from "../utils/apply-search-result";
import type { ElectionSearchIndex, SearchNavigationOptions, SearchResult } from "../types/search.types";

export interface UseSearchNavigationResult {
  navigateToResult: (result: SearchResult, options?: SearchNavigationOptions) => boolean;
}

export function useSearchNavigation(index: ElectionSearchIndex | null): UseSearchNavigationResult {
  const { syncSelectionFeature } = useDashboardFeatureSync();
  const setStateFilter = useDashboardStore((state) => state.setStateFilter);
  const setPartyFilter = useDashboardStore((state) => state.setPartyFilter);
  const requestMapZoom = useDashboardStore((state) => state.requestMapZoom);
  const requestMapReset = useDashboardStore((state) => state.requestMapReset);
  const applyFilters = useDashboardStore((state) => state.applyFilters);

  const navigateToResult = useCallback(
    (result: SearchResult, options?: SearchNavigationOptions) => {
      if (!index) {
        return false;
      }

      return applySearchResult(
        result,
        index,
        {
          setStateFilter,
          setPartyFilter,
          syncSelectionFeature,
          requestMapZoom,
          requestMapReset,
          applyFilters,
        },
        options,
      );
    },
    [
      applyFilters,
      index,
      requestMapReset,
      requestMapZoom,
      setPartyFilter,
      setStateFilter,
      syncSelectionFeature,
    ],
  );

  return { navigateToResult };
}
