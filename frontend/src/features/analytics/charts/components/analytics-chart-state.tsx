"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AnalyticsChartModel } from "../types";

interface AnalyticsChartStateViewProps {
  chart: Pick<AnalyticsChartModel, "status" | "emptyMessage" | "errorMessage">;
  className?: string;
}

export function AnalyticsChartStateView({ chart, className }: AnalyticsChartStateViewProps) {
  if (chart.status === "loading") {
    return (
      <div className={cn("flex min-h-[220px] items-center justify-center", className)}>
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (chart.status === "error") {
    return (
      <div
        className={cn(
          "flex min-h-[220px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700",
          className,
        )}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <div className="font-medium text-rose-900">Chart data unavailable</div>
            <div className="text-sm text-rose-700">
              {chart.errorMessage ?? "The analytics chart could not be generated."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chart.status === "empty") {
    return (
      <div
        className={cn(
          "flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600",
          className,
        )}
      >
        <div className="max-w-[22rem] text-center">
          <div className="font-medium text-zinc-950">No chart data in the current scope</div>
          <div className="mt-1">{chart.emptyMessage}</div>
        </div>
      </div>
    );
  }

  return null;
}

