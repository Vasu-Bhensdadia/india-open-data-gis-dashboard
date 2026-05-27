"use client";

import type { DashboardKpiMetric } from "../types/analytics.types";
import { DashboardKpiCard } from "./dashboard-kpi-card";

interface DashboardKpiGridProps {
  metrics: DashboardKpiMetric[];
  loading?: boolean;
}

export function DashboardKpiGrid({ metrics, loading = false }: DashboardKpiGridProps) {
  const displayMetrics: DashboardKpiMetric[] =
    loading && metrics.length === 0
      ? Array.from(
          { length: 6 },
          (_, index) =>
            ({
              id: `loading-kpi-${index}`,
              label: "Loading",
              value: "",
              description: "",
              subvalue: "",
              tone: "neutral" as const,
            }) as DashboardKpiMetric,
        )
      : metrics;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {displayMetrics.map((metric) => (
        <DashboardKpiCard key={metric.id} metric={metric} loading={loading} />
      ))}
    </div>
  );
}
