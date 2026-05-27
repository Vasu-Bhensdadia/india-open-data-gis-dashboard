"use client";

import { useEffect, useMemo } from "react";

import {
  selectActiveAnalyticsChartIds,
  selectAnalyticsDataSourcePreference,
  selectAnalyticsLayoutMode,
  selectSelectedAnalyticsChartId,
  useAnalyticsStore,
} from "@/features/analytics/analytics.store";
import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type { DashboardAnalyticsSummary } from "../../types/analytics.types";
import { buildAnalyticsChartModels } from "../utils/chart-transformers";
import type { AnalyticsChartModel, AnalyticsChartTransformInput } from "../types";

export interface UseAnalyticsChartsInput {
  summary: DashboardAnalyticsSummary | null;
  features: GeoJSONFeature<Record<string, unknown>>[] | null;
  metricsIndex: ElectionMetricsIndex | null;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
  selectedMetricKey: ChoroplethMetricKey;
  isLoading: boolean;
  errorMessage: string | null;
}

export interface UseAnalyticsChartsResult {
  allChartModels: AnalyticsChartModel[];
  chartModels: AnalyticsChartModel[];
  activeChartIds: ReturnType<typeof selectActiveAnalyticsChartIds>;
  selectedChartId: ReturnType<typeof selectSelectedAnalyticsChartId>;
  dataSourcePreference: ReturnType<typeof selectAnalyticsDataSourcePreference>;
  layoutMode: ReturnType<typeof selectAnalyticsLayoutMode>;
  setSelectedChartId: (chartId: AnalyticsChartModel["id"] | null) => void;
}

export function useAnalyticsCharts(input: UseAnalyticsChartsInput): UseAnalyticsChartsResult {
  const activeChartIds = useAnalyticsStore(selectActiveAnalyticsChartIds);
  const selectedChartId = useAnalyticsStore(selectSelectedAnalyticsChartId);
  const dataSourcePreference = useAnalyticsStore(selectAnalyticsDataSourcePreference);
  const layoutMode = useAnalyticsStore(selectAnalyticsLayoutMode);
  const setSelectedChartId = useAnalyticsStore((state) => state.setSelectedChartId);

  const chartInput = useMemo<AnalyticsChartTransformInput>(
    () => ({
      features: input.features,
      allFeatureCount: input.summary?.allConstituencies ?? input.features?.length ?? 0,
      metricsIndex: input.metricsIndex,
      isLoading: input.isLoading,
      errorMessage: input.errorMessage,
      summary: input.summary,
      selectedMetricKey: input.selectedMetricKey,
      selectedMetricLabel: input.selectedMetric?.label ?? null,
      selectedMetricKind: input.selectedMetric?.kind ?? null,
      selectedMetricDescriptor: input.selectedMetric,
    }),
    [
      input.errorMessage,
      input.features,
      input.isLoading,
      input.metricsIndex,
      input.selectedMetric,
      input.selectedMetricKey,
      input.summary,
    ],
  );

  const allChartModels = useMemo(() => buildAnalyticsChartModels(chartInput), [chartInput]);

  const chartModels = useMemo(() => {
    const modelById = new Map(allChartModels.map((chart) => [chart.id, chart] as const));
    const visibleModels = activeChartIds
      .map((chartId) => modelById.get(chartId))
      .filter((chart): chart is AnalyticsChartModel => Boolean(chart));

    return visibleModels.length > 0 ? visibleModels : allChartModels;
  }, [activeChartIds, allChartModels]);

  useEffect(() => {
    if (selectedChartId && !activeChartIds.includes(selectedChartId)) {
      setSelectedChartId(null);
    }
  }, [activeChartIds, selectedChartId, setSelectedChartId]);

  return {
    allChartModels,
    chartModels,
    activeChartIds,
    selectedChartId,
    dataSourcePreference,
    layoutMode,
    setSelectedChartId,
  };
}
