"use client";

import type { ReactNode } from "react";

import type {
  AnalyticsChartId,
  AnalyticsChartLayoutMode,
  AnalyticsChartModel,
} from "../types";
import { AnalyticsBarChart } from "./analytics-bar-chart";
import { AnalyticsDistributionChart } from "./analytics-distribution-chart";
import { AnalyticsPieChart } from "./analytics-pie-chart";
import { AnalyticsTrendChart } from "./analytics-trend-chart";

interface AnalyticsChartGridProps {
  charts: AnalyticsChartModel[];
  layoutMode: AnalyticsChartLayoutMode;
  selectedChartId: AnalyticsChartId | null;
  onSelectChart: (chartId: AnalyticsChartId) => void;
}

function renderChart(
  chart: AnalyticsChartModel,
  selectedChartId: AnalyticsChartId | null,
  onSelectChart: (chartId: AnalyticsChartId) => void,
): ReactNode {
  const selected = chart.id === selectedChartId;

  switch (chart.kind) {
    case "bar":
      return <AnalyticsBarChart chart={chart} selected={selected} onSelect={onSelectChart} />;
    case "pie":
      return <AnalyticsPieChart chart={chart} selected={selected} onSelect={onSelectChart} />;
    case "trend":
      return <AnalyticsTrendChart chart={chart} selected={selected} onSelect={onSelectChart} />;
    case "distribution":
      return (
        <AnalyticsDistributionChart
          chart={chart}
          selected={selected}
          onSelect={onSelectChart}
        />
      );
    default:
      return null;
  }
}

export function AnalyticsChartGrid({
  charts,
  layoutMode,
  selectedChartId,
  onSelectChart,
}: AnalyticsChartGridProps) {
  const containerClassName =
    layoutMode === "stacked"
      ? "space-y-3"
      : "grid grid-cols-1 gap-3 xl:grid-cols-2";

  if (charts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
        No charts are available for the current dashboard state.
      </div>
    );
  }

  return <div className={containerClassName}>{charts.map((chart) => <div key={chart.id}>{renderChart(chart, selectedChartId, onSelectChart)}</div>)}</div>;
}

