"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsChartModel } from "../types";

interface AnalyticsChartFrameProps {
  chart: AnalyticsChartModel;
  selected?: boolean;
  onSelect?: (chartId: AnalyticsChartModel["id"]) => void;
  children: ReactNode;
  className?: string;
}

const statusStyles: Record<
  AnalyticsChartModel["status"],
  { label: string; shell: string; dot: string }
> = {
  loading: {
    label: "Loading",
    shell: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  ready: {
    label: "Ready",
    shell: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  empty: {
    label: "Empty",
    shell: "border-zinc-200 bg-zinc-50 text-zinc-600",
    dot: "bg-zinc-400",
  },
  error: {
    label: "Error",
    shell: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export function AnalyticsChartFrame({
  chart,
  selected = false,
  onSelect,
  children,
  className,
}: AnalyticsChartFrameProps) {
  const status = statusStyles[chart.status];
  const isInteractive = Boolean(onSelect);
  const showMetricMeta = chart.status === "ready" || chart.status === "empty";
  const handleSelect = () => {
    onSelect?.(chart.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card
      size="sm"
      className={cn(
        "border shadow-none transition-all duration-200",
        selected ? "border-sky-300 bg-sky-50/40 ring-1 ring-sky-400/70" : "border-zinc-200",
        isInteractive ? "cursor-pointer hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm" : null,
        className,
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={isInteractive ? handleSelect : undefined}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="px-3 pb-0 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-semibold text-zinc-950">
              {chart.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-zinc-500">
              {chart.description}
            </CardDescription>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                status.shell,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {chart.sourceLabel}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-2">
        {showMetricMeta && chart.metricLabel ? (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
              {chart.metricLabel}
            </span>
            <span>{chart.totalItems.toLocaleString()} items</span>
          </div>
        ) : null}

        {children}
      </CardContent>
    </Card>
  );
}
