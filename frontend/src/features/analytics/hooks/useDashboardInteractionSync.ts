"use client";

import { useMemo } from "react";

import { selectHoveredFeature, selectSelectedFeature, useDashboardStore } from "@/store";
import type { ChoroplethMetricDescriptor } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import { createConstituencyInteractionContext, createDashboardInteractionEvent } from "../utils/interaction-events";

export interface UseDashboardInteractionSyncInput {
  metricsIndex: ElectionMetricsIndex | null;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
}

export interface DashboardInteractionSyncState {
  hoverEvent: ReturnType<typeof createDashboardInteractionEvent> | null;
  selectionEvent: ReturnType<typeof createDashboardInteractionEvent> | null;
  activeEvent: ReturnType<typeof createDashboardInteractionEvent> | null;
}

export function useDashboardInteractionSync(
  input: UseDashboardInteractionSyncInput,
): DashboardInteractionSyncState {
  const hoveredFeature = useDashboardStore(selectHoveredFeature);
  const selectedFeature = useDashboardStore(selectSelectedFeature);

  const hoverContext = useMemo(
    () =>
      hoveredFeature
        ? createConstituencyInteractionContext(hoveredFeature, input.selectedMetric, input.metricsIndex)
        : null,
    [hoveredFeature, input.metricsIndex, input.selectedMetric],
  );

  const selectionContext = useMemo(
    () =>
      selectedFeature
        ? createConstituencyInteractionContext(
            selectedFeature,
            input.selectedMetric,
            input.metricsIndex,
          )
        : null,
    [selectedFeature, input.metricsIndex, input.selectedMetric],
  );

  const hoverEvent = useMemo(
    () => (hoverContext ? createDashboardInteractionEvent("hover", "map", hoverContext) : null),
    [hoverContext],
  );

  const selectionEvent = useMemo(
    () =>
      selectionContext
        ? createDashboardInteractionEvent("selection", "map", selectionContext)
        : null,
    [selectionContext],
  );

  const activeEvent = hoverEvent ?? selectionEvent ?? null;

  return {
    hoverEvent,
    selectionEvent,
    activeEvent,
  };
}

