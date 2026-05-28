"use client";

import { cn } from "@/lib/utils";
import type { DashboardInteractionEvent } from "../utils/interaction-events";

interface DashboardInteractionBannerProps {
  event: DashboardInteractionEvent | null;
  loading?: boolean;
}

const stateStyles: Record<
  DashboardInteractionEvent["kind"] | "idle",
  { shell: string; badge: string; label: string }
> = {
  hover: {
    shell: "border-sky-200 bg-sky-50 text-sky-950",
    badge: "bg-sky-600 text-white",
    label: "Hover",
  },
  selection: {
    shell: "border-emerald-200 bg-emerald-50 text-emerald-950",
    badge: "bg-emerald-600 text-white",
    label: "Selection",
  },
  idle: {
    shell: "border-zinc-200 bg-zinc-50 text-zinc-700",
    badge: "bg-zinc-600 text-white",
    label: "Context",
  },
};

export function DashboardInteractionBanner({
  event,
  loading = false,
}: DashboardInteractionBannerProps) {
  const state = event ? stateStyles[event.kind] : stateStyles.idle;

  return (
    <div className={cn("rounded-xl border px-3 py-3 text-sm", state.shell)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]", state.badge)}>
              {state.label}
            </span>
            <span className="truncate font-medium">
              {loading
                ? "Updating context..."
                : event?.title ?? "Hover a constituency to inspect contextual analytics."}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-700/75">
            {loading ? "Synchronizing map and analytics state." : event?.detail ?? "Analytics context follows map hover and selection."}
          </p>
        </div>

        {event?.context?.metricLabel ? (
          <div className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-zinc-700 ring-1 ring-black/5">
            {event.context.metricLabel}
            {event.context.metricValue !== null ? `: ${event.context.metricValue}` : ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}
