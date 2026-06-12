"use client";

import * as React from "react";
import { AlertCircle, Map, TrendingUp, FileText } from "lucide-react";
import type { GeoJSONFeature } from "@/types/geojson";
import type { ElectionMetrics } from "@/services/election-metrics.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildConstituencyProfile,
  formatConstituencyProfile,
  getPartyColor,
  getPartyTone,
} from "../utils/constituency-profile";
import { ElectionSummaryCard } from "./election-summary-card";
import { ConstituencyReportPrintPortal } from "./constituency-report";
import { printReport } from "../utils/report-generator";

/**
 * Constituency Profile Component
 *
 * Displays a detailed intelligence panel for a selected constituency,
 * including:
 * - Constituency identification (name, state, number, type)
 * - Winner information (candidate, party, votes)
 * - Runner-up information (candidate, party, votes)
 * - Key metrics (margin, margin %, total votes)
 *
 * Integrates with the dashboard store to reactively update when
 * a different constituency is selected from the map.
 *
 * Responsive layout adapts from single-column (mobile) to
 * multi-column grid (tablet/desktop).
 */

interface ConstituencyProfileProps {
  /**
   * The selected constituency feature (GeoJSON)
   */
  feature: GeoJSONFeature<Record<string, unknown>> | null;

  /**
   * Election metrics for the constituency
   */
  metrics: ElectionMetrics | null;

  /**
   * Is data loading
   */
  loading?: boolean;

  /**
   * Error message if data loading failed
   */
  error?: string | null;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Header section with constituency identification.
 * Displays name, state, number, and type in a clean layout.
 */
function ConstituencyHeader({
  name,
  state,
  number,
  type,
}: {
  name: string;
  state: string;
  number: string;
  type: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 truncate">{name}</h3>
          <p className="mt-1 text-sm text-slate-600">{state}</p>
        </div>
        <div className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            {type}
          </p>
        </div>
      </div>
      {number && number !== "N/A" && (
        <div className="flex items-center gap-2 pt-1">
          <Map className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">
            Constituency #{number}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Metrics summary section.
 * Displays winning margin, margin %, and total votes cast.
 */
function MetricsSummary({
  margin,
  marginPercentage,
  totalVotes,
}: {
  margin: string;
  marginPercentage: string;
  totalVotes: string;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-slate-600" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Key Metrics
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Margin</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{margin}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Margin %</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{marginPercentage}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Total Votes</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{totalVotes}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main ConstituencyProfile component
 */
export function ConstituencyProfile({
  feature,
  metrics,
  loading = false,
  error = null,
  className,
}: ConstituencyProfileProps) {


  // Guard: nothing selected
  if (!feature && !loading && !error) {
    return (
      <Card className={cn("border-dashed border-zinc-300 bg-zinc-50", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Map className="mb-2 h-8 w-8 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-600">No constituency selected</p>
          <p className="mt-1 text-xs text-zinc-500">
            Click on a constituency on the map to view its profile
          </p>
        </CardContent>
      </Card>
    );
  }

  // Guard: error state
  if (error) {
    return (
      <Card className={cn("border-amber-200 bg-amber-50", className)}>
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Unable to load constituency data</p>
            <p className="mt-1 text-xs text-amber-800">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Guard: no metrics available
  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="mb-2 h-8 w-8 text-amber-500" />
          <p className="text-sm font-medium text-slate-600">Metrics not available</p>
          <p className="mt-1 text-xs text-slate-500">
            Election data for this constituency is not available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Build and format the profile data
  const featureProperties = feature?.properties as Record<string, unknown> | undefined;
  const profileData = buildConstituencyProfile(metrics, featureProperties);
  const formatted = formatConstituencyProfile(profileData);

  const winnerTone = getPartyTone(formatted.winner.party);
  const runnerUpTone = getPartyTone(formatted.runnerUp.party);
  const winnerColor = getPartyColor(formatted.winner.party);
  const runnerUpColor = getPartyColor(formatted.runnerUp.party);

  return (
    <>
      <Card className={cn("border-slate-200 bg-white", className)}>
        {/* Header */}
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Constituency Profile
            </p>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => { printReport(); }}
              className="h-6 gap-1"
            >
              <FileText className="h-3 w-3" />
              <span>Report</span>
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4 pt-4">
          {/* Constituency Header */}
          <ConstituencyHeader
            name={formatted.constituencyName}
            state={formatted.stateName}
            number={formatted.constituencyNumber}
            type={formatted.constituencyType}
          />

          {/* Winner and Runner-up Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ElectionSummaryCard
              title="Winner"
              candidateName={formatted.winner.candidate}
              partyName={formatted.winner.party}
              votes={formatted.winner.votes}
              accentColor={winnerColor}
              tone={winnerTone}
            />

            <ElectionSummaryCard
              title="Runner-up"
              candidateName={formatted.runnerUp.candidate}
              partyName={formatted.runnerUp.party}
              votes={formatted.runnerUp.votes}
              accentColor={runnerUpColor}
              tone={runnerUpTone}
            />
          </div>

          {/* Key Metrics Summary */}
          <MetricsSummary
            margin={formatted.metrics.margin}
            marginPercentage={formatted.metrics.marginPercentage}
            totalVotes={formatted.metrics.totalVotes}
          />

          {/* Turnout Info */}
          {formatted.metrics.turnout !== "N/A" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Voter Turnout
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">{formatted.metrics.turnout}</p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Invisible Print Component in Portal */}
      <ConstituencyReportPrintPortal metrics={metrics} feature={feature} />
    </>
  );
}
