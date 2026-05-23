"use client";

import { useChoroplethModeStore } from "../choropleth.store";
import type { ChoroplethMetricKey } from "../types/choropleth";

export function ChoroplethMetricSelector() {
  const selectedMetricKey = useChoroplethModeStore((state) => state.selectedMetricKey);
  const setSelectedMetricKey = useChoroplethModeStore((state) => state.setSelectedMetricKey);
  const metricConfig = useChoroplethModeStore((state) => state.metricConfig);

  const metricOptions = Object.values(metricConfig) as {
    key: ChoroplethMetricKey;
    label: string;
    description: string;
  }[];

  return (
    <div className="pointer-events-auto w-[240px] rounded-lg bg-white/95 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Metric</div>
      <div className="mt-2 space-y-2">
        {metricOptions.map((metric) => (
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
            <div className="mt-1 text-[11px] leading-4 text-slate-500">
              {metric.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
