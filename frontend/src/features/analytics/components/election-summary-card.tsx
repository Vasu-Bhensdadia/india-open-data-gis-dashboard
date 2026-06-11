"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Reusable card for displaying election result summaries.
 * Shows vote counts, parties, candidates, and other election metrics
 * in a consistent, responsive format.
 */

export interface ElectionSummaryCardProps {
  /**
   * Card title/label (e.g., "Winner", "Runner-up")
   */
  title: string;

  /**
   * Candidate name
   */
  candidateName: string;

  /**
   * Political party name
   */
  partyName: string;

  /**
   * Vote count
   */
  votes: string;

  /**
   * Optional color accent for party representation
   */
  accentColor?: string;

  /**
   * Optional background tone
   */
  tone?: "blue" | "amber" | "rose" | "emerald" | "neutral";

  /**
   * Additional metadata to display below main content
   */
  metadata?: Array<{
    label: string;
    value: string;
  }>;

  /**
   * Is loading state
   */
  loading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const toneStyles: Record<
  "blue" | "amber" | "rose" | "emerald" | "neutral",
  { shell: string; accent: string }
> = {
  neutral: {
    shell: "border-zinc-200 bg-white",
    accent: "bg-zinc-400",
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

/**
 * ElectionSummaryCard Component
 *
 * Displays election result information with party color coding and vote metrics.
 * Part of the constituency intelligence panel.
 */
export function ElectionSummaryCard({
  title,
  candidateName,
  partyName,
  votes,
  accentColor,
  tone = "neutral",
  metadata,
  className,
}: ElectionSummaryCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      size="sm"
      className={cn(
        "min-h-[140px] overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        styles.shell,
        className,
      )}
    >
      <CardContent className="space-y-3 px-4 py-4">
        {/* Header with title and accent dot */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {title}
            </p>
          </div>
          {accentColor && (
            <div
              className="h-3 w-3 shrink-0 rounded-full shadow-sm"
              style={{ backgroundColor: accentColor }}
              aria-label={`${partyName} color indicator`}
            />
          )}
        </div>

        {/* Candidate Name and Party */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{candidateName}</p>
          <p className="text-xs text-slate-600">{partyName}</p>
        </div>

        {/* Vote Count */}
        <div className="space-y-0.5 border-t border-slate-200/50 pt-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Votes
          </p>
          <p className="text-lg font-bold tracking-tight text-slate-950">{votes}</p>
        </div>

        {/* Additional Metadata */}
        {metadata && metadata.length > 0 && (
          <div className="space-y-2 border-t border-slate-200/50 pt-2">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
