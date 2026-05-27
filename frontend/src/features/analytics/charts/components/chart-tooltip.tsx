"use client";

import { cn } from "@/lib/utils";

interface AnalyticsChartTooltipLine {
  label: string;
  value: string;
  swatch?: string;
}

interface AnalyticsChartTooltipCardProps {
  title: string;
  subtitle?: string;
  lines: AnalyticsChartTooltipLine[];
  footer?: string;
  className?: string;
}

export function AnalyticsChartTooltipCard({
  title,
  subtitle,
  lines,
  footer,
  className,
}: AnalyticsChartTooltipCardProps) {
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border border-zinc-200 bg-white/95 px-3 py-2.5 text-xs shadow-lg shadow-slate-200/70 backdrop-blur-sm",
        className,
      )}
    >
      <div className="font-semibold text-zinc-950">{title}</div>
      {subtitle ? <div className="mt-0.5 text-[11px] text-zinc-500">{subtitle}</div> : null}

      <div className="mt-2 space-y-1">
        {lines.map((line) => (
          <div key={`${line.label}-${line.value}`} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {line.swatch ? (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: line.swatch }}
                />
              ) : null}
              <span className="min-w-0 truncate text-zinc-500">{line.label}</span>
            </div>
            <span className="shrink-0 font-medium text-zinc-950">{line.value}</span>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-2 border-t border-zinc-100 pt-2 text-[11px] text-zinc-500">{footer}</div> : null}
    </div>
  );
}

export type { AnalyticsChartTooltipLine };

