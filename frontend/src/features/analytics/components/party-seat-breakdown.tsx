"use client";

import { getPartyColor } from "@/services/election-metrics.service";
import type { PartySeatCount } from "../types/analytics.types";

interface PartySeatBreakdownProps {
  partySeatCounts: PartySeatCount[];
  loading?: boolean;
}

export function PartySeatBreakdown({ partySeatCounts, loading = false }: PartySeatBreakdownProps) {
  const visibleParties = partySeatCounts.slice(0, 5);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Party seat counts</h3>
          <p className="text-xs text-zinc-500">Leading parties within the current filter scope.</p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          {loading ? "Loading" : `${partySeatCounts.length} parties`}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`party-skeleton-${index}`}
                className="h-11 animate-pulse rounded-lg bg-zinc-100/80"
              />
            ))
          : visibleParties.map((party) => (
              <div
                key={party.partyName}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getPartyColor(party.partyName) }}
                  />
                  <span className="truncate text-sm font-medium text-zinc-800">
                    {party.partyName}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-zinc-950">{party.seatCount}</div>
                  <div className="text-[11px] text-zinc-500">
                    {party.sharePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
        {!loading && visibleParties.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
            No party data is available for the current map scope.
          </div>
        ) : null}
      </div>

      {!loading && partySeatCounts.length > visibleParties.length ? (
        <div className="mt-3 text-xs text-zinc-500">
          {partySeatCounts.length - visibleParties.length} more parties are available in the
          summary.
        </div>
      ) : null}
    </section>
  );
}
