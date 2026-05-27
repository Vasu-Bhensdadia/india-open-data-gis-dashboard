"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  selectIsChoroplethConfigLoaded,
  selectMetricConfig,
  selectSelectedMetricKey,
  useDashboardStore,
} from "@/store";
import type { ChoroplethMetricKey } from "../types/choropleth";

export function ChoroplethMetricSelector() {
  const selectedMetricKey = useDashboardStore(selectSelectedMetricKey);
  const setSelectedMetricKey = useDashboardStore((state) => state.setChoroplethMetric);
  const metricConfig = useDashboardStore(selectMetricConfig);
  const isConfigLoaded = useDashboardStore(selectIsChoroplethConfigLoaded);

  const metricOptions = Object.values(metricConfig).filter(Boolean) as {
    key: ChoroplethMetricKey;
    label: string;
    description: string;
  }[];

  return (
    <div className="pointer-events-auto w-[240px] rounded-lg bg-white/95 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Metric</div>
      <div className="mt-2 space-y-2">
        {!isConfigLoaded ? (
          <>
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </>
        ) : metricOptions.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
            No choropleth metrics are available yet.
          </div>
        ) : (
          metricOptions.map((metric) => (
            <button
              key={metric.key}
              type="button"
              onClick={() => setSelectedMetricKey(metric.key)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                metric.key === selectedMetricKey
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="font-medium">{metric.label}</div>
              <div
                className={`mt-1 text-[11px] leading-4 ${metric.key === selectedMetricKey ? "text-slate-200" : "text-slate-500"}`}
              >
                {metric.description}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
