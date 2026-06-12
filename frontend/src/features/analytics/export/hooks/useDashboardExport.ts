"use client";

import { useCallback, useMemo, useState } from "react";

import {
  selectFiltersSnapshot,
  selectSelectedMetricKey,
  useDashboardStore,
} from "@/store";
import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import type { AnalyticsChartModel } from "../../charts/types";
import type {
  DashboardAnalyticsSummary,
  DashboardKpiMetric,
} from "../../types/analytics.types";
import {
  canExportDashboard,
  exportDashboardDataset,
} from "../services/dashboard-export.service";
import type {
  DashboardExportContext,
  DashboardExportDataset,
  DashboardExportFormat,
  DashboardExportResult,
} from "../types";

export interface UseDashboardExportInput {
  summary: DashboardAnalyticsSummary | null;
  kpiMetrics: DashboardKpiMetric[];
  filteredFeatures: GeoJSONFeature<Record<string, unknown>>[] | null;
  metricsIndex: ElectionMetricsIndex | null;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
  selectedMetricKey: ChoroplethMetricKey;
  chartModels: AnalyticsChartModel[];
  totalFeatureCount: number;
  filteredFeatureCount: number;
  isLoading?: boolean;
}

export interface UseDashboardExportResult {
  canExport: boolean;
  isExporting: boolean;
  lastExport: DashboardExportResult | null;
  exportError: string | null;
  exportDataset: (
    dataset: DashboardExportDataset,
    format: DashboardExportFormat,
  ) => DashboardExportResult | null;
}

export function useDashboardExport(input: UseDashboardExportInput): UseDashboardExportResult {
  const filtersSnapshot = useDashboardStore(selectFiltersSnapshot);
  const storeSelectedMetricKey = useDashboardStore(selectSelectedMetricKey);

  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<DashboardExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportContext = useMemo<DashboardExportContext | null>(() => {
    if (!input.summary || !input.filteredFeatures || !input.metricsIndex) {
      return null;
    }

    return {
      summary: input.summary,
      kpiMetrics: input.kpiMetrics,
      filteredFeatures: input.filteredFeatures,
      metricsIndex: input.metricsIndex,
      selectedMetric: input.selectedMetric,
      selectedMetricKey: input.selectedMetricKey ?? storeSelectedMetricKey,
      filtersSnapshot,
      chartModels: input.chartModels,
      totalFeatureCount: input.totalFeatureCount,
      filteredFeatureCount: input.filteredFeatureCount,
    };
  }, [
    filtersSnapshot,
    input.chartModels,
    input.filteredFeatureCount,
    input.filteredFeatures,
    input.kpiMetrics,
    input.metricsIndex,
    input.selectedMetric,
    input.selectedMetricKey,
    input.summary,
    input.totalFeatureCount,
    storeSelectedMetricKey,
  ]);

  const canExport = canExportDashboard(exportContext) && !input.isLoading;

  const exportDataset = useCallback(
    (dataset: DashboardExportDataset, format: DashboardExportFormat) => {
      if (!exportContext || !canExport) {
        setExportError("Dashboard data is not ready for export yet.");
        return null;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const result = exportDashboardDataset(exportContext, dataset, format);
        setLastExport(result);
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to export dashboard data.";
        setExportError(message);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    [canExport, exportContext],
  );

  return {
    canExport,
    isExporting,
    lastExport,
    exportError,
    exportDataset,
  };
}
