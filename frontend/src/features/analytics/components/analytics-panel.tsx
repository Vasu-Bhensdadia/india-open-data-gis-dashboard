"use client";

import { AlertTriangle, BarChart3, Loader2 } from "lucide-react";

import { useIndiaGeoJSON } from "@/features/maps/hooks/useIndiaGeoJSON";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import type { AnalyticsProvider } from "../types/analytics.types";
import { AnalyticsChartGrid } from "../charts/components/analytics-chart-grid";
import { useAnalyticsCharts } from "../charts/hooks/useAnalyticsCharts";
import { DashboardKpiGrid } from "./dashboard-kpi-grid";
import { PartySeatBreakdown } from "./party-seat-breakdown";

interface AnalyticsPanelProps {
  provider?: AnalyticsProvider | null;
}

export function AnalyticsPanel({ provider }: AnalyticsPanelProps) {
  const {
    data,
    loading: isFeaturesLoading,
    error: geojsonError,
  } = useIndiaGeoJSON("india_pc_2019", {
    cacheKey: "india-parliamentary-constituencies",
  });

  const {
    summary,
    kpiMetrics,
    isLoading,
    error,
    totalFeatureCount,
    filteredFeatureCount,
    filteredFeatures,
    metricsIndex,
    selectedMetric,
    selectedMetricKey,
  } = useDashboardAnalytics(data?.features ?? null, { provider });

  const {
    chartModels,
    layoutMode,
    selectedChartId,
    setSelectedChartId,
  } = useAnalyticsCharts({
    summary,
    features: filteredFeatures,
    metricsIndex,
    selectedMetric,
    selectedMetricKey,
    isLoading,
    errorMessage: error?.message ?? geojsonError?.message ?? null,
  });

  const isBusy = isFeaturesLoading || isLoading;
  const showEmptySummary = !isBusy && summary !== null && summary.totalConstituencies === 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-700" />
              <h2 className="text-base font-semibold text-zinc-950">Analytics & Insights</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Live KPI summary from the filtered GIS dataset.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
              {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {isBusy
                ? "Loading"
                : summary?.source === "backend"
                  ? "Backend"
                  : summary
                    ? "Client"
                    : error
                      ? "Unavailable"
                      : "Pending"}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              {summary
                ? "Updated from the current filter and selection state."
                : "Waiting for dashboard data."}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          {isBusy
            ? "Calculating dashboard summary..."
            : summary
              ? `Showing ${filteredFeatureCount.toLocaleString()} of ${totalFeatureCount.toLocaleString()} constituencies in scope.`
              : "Analytics data is not available yet."}
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error.message}</span>
          </div>
        ) : null}

        {showEmptySummary ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
            <div className="font-medium text-zinc-950">
              No constituencies match the current filters.
            </div>
            <div className="mt-1">
              The KPI cards still update live, but the filtered GIS set is empty.
            </div>
          </div>
        ) : null}

        <DashboardKpiGrid metrics={kpiMetrics} loading={isBusy} />

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">Charts</h3>
            <p className="text-xs text-zinc-500">
              Reusable chart views that follow the same filter and metric state as the map.
            </p>
          </div>

          <AnalyticsChartGrid
            charts={chartModels}
            layoutMode={layoutMode}
            selectedChartId={selectedChartId}
            onSelectChart={setSelectedChartId}
          />
        </div>

        <PartySeatBreakdown partySeatCounts={summary?.partySeatCounts ?? []} loading={isBusy} />

        {geojsonError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Unable to load constituency geometry.
          </div>
        ) : null}
      </div>
    </section>
  );
}
