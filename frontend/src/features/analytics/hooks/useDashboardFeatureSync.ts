"use client";

import { useCallback } from "react";

import { useDashboardStore } from "@/store";
import type { GeoJSONFeature } from "@/types/geojson";
import { createConstituencyMapMetadata } from "../utils/interaction-events";

export interface DashboardFeatureSyncResult {
  syncHoverFeature: (feature: GeoJSONFeature<Record<string, unknown>> | null) => void;
  clearHoverFeature: () => void;
  syncSelectionFeature: (feature: GeoJSONFeature<Record<string, unknown>> | null) => void;
  clearSelectionFeature: () => void;
}

export function useDashboardFeatureSync(): DashboardFeatureSyncResult {
  const hoverConstituency = useDashboardStore((state) => state.hoverConstituency);
  const selectConstituency = useDashboardStore((state) => state.selectConstituency);
  const deselectConstituency = useDashboardStore((state) => state.deselectConstituency);

  const syncHoverFeature = useCallback(
    (feature: GeoJSONFeature<Record<string, unknown>> | null) => {
      if (!feature) {
        hoverConstituency(null, null, null);
        return;
      }

      const metadata = createConstituencyMapMetadata(feature);
      hoverConstituency(metadata.featureId, metadata.regionName, feature, metadata);
    },
    [hoverConstituency],
  );

  const clearHoverFeature = useCallback(() => {
    hoverConstituency(null, null, null);
  }, [hoverConstituency]);

  const syncSelectionFeature = useCallback(
    (feature: GeoJSONFeature<Record<string, unknown>> | null) => {
      if (!feature) {
        deselectConstituency();
        return;
      }

      const metadata = createConstituencyMapMetadata(feature);
      selectConstituency(metadata.featureId, metadata.regionName, feature, metadata);
    },
    [deselectConstituency, selectConstituency],
  );

  const clearSelectionFeature = useCallback(() => {
    deselectConstituency();
  }, [deselectConstituency]);

  return {
    syncHoverFeature,
    clearHoverFeature,
    syncSelectionFeature,
    clearSelectionFeature,
  };
}

