"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AnalyticsTone, DashboardKpiMetric } from "../types/analytics.types";

interface DashboardKpiCardProps {
  metric: DashboardKpiMetric;
  loading?: boolean;
  className?: string;
}

const toneStyles: Record<AnalyticsTone, { shell: string; accent: string }> = {
  neutral: {
    shell: "border-slate-200 bg-white",
    accent: "bg-slate-500",
  },
  blue: {
    shell: "border-sky-200 bg-sky-50/50",
    accent: "bg-sky-600",
  },
  emerald: {
    shell: "border-emerald-200 bg-emerald-50/50",
    accent: "bg-emerald-600",
  },
  amber: {
    shell: "border-amber-200 bg-amber-50/50",
    accent: "bg-amber-600",
  },
  rose: {
    shell: "border-rose-200 bg-rose-50/50",
    accent: "bg-rose-600",
  },
};

function MetricText({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-slate-600", className)}>{children}</p>;
}

export function DashboardKpiCard({ metric, loading = false, className }: DashboardKpiCardProps) {
  const tone = toneStyles[metric.tone ?? "neutral"];

  return (
    <Card
      size="sm"
      className={cn(
        "min-h-[132px] overflow-hidden border shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        tone.shell,
        className,
      )}
    >
      <CardContent className="space-y-3 px-3 py-3">
        {loading ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {metric.label}
                </p>
                <div className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950">
                  {metric.value}
                </div>
              </div>
              <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", tone.accent)} />
            </div>

            {metric.description ? (
              <MetricText className="text-xs">{metric.description}</MetricText>
            ) : null}
            {metric.subvalue ? (
              <MetricText className="text-xs text-slate-500">{metric.subvalue}</MetricText>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
