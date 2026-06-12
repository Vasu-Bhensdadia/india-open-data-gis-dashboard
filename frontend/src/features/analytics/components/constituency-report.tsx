"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Calendar, Landmark, Users, Vote, Award } from "lucide-react";
import type { ElectionMetrics } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import { generateReportData, type ConstituencyReportData } from "../utils/report-generator";
import { cn } from "@/lib/utils";

interface ConstituencyReportProps {
  reportData: ConstituencyReportData;
  isPrintLayout?: boolean;
}

/**
 * ConstituencyReport
 *
 * Displays a premium, detailed election report for a single constituency.
 * Fits beautifully inside an A4 sheet for printing/PDF, or a modal overlay on-screen.
 */
export function ConstituencyReport({ reportData, isPrintLayout = false }: ConstituencyReportProps) {
  const {
    constituencyName,
    stateName,
    constituencyNumber,
    constituencyType,
    statistics,
    generatedAt,
  } = reportData;

  return (
    <div
      className={cn(
        "w-full bg-white text-slate-900 font-sans leading-relaxed antialiased",
        isPrintLayout ? "p-8 max-w-[210mm] mx-auto min-h-[297mm]" : "p-4 sm:p-6"
      )}
    >
      {/* Report Brand Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-2 mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-[10px] tracking-widest uppercase">
            <Landmark className="h-3.5 w-3.5" />
            India Election Intelligence Dashboard
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-950 mt-0.5 tracking-tight">
            CONSTITUENCY PROFILE REPORT
          </h1>
        </div>
        <div className="text-right flex flex-col items-end text-slate-500 text-[10px] mt-0.5 sm:mt-0 leading-tight">
          <span className="font-bold uppercase tracking-wider text-slate-700">INDIA-OPEN-DATA-GIS</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="h-3 w-3" />
            <span>Generated: {generatedAt}</span>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 mb-4 break-inside-avoid">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-slate-200 md:border-r pb-1 md:pb-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Constituency</span>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5 leading-tight">{constituencyName}</h2>
          </div>
          <div className="border-slate-200 md:border-r pb-1 md:pb-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">State / UT</span>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-tight">{stateName}</p>
          </div>
          <div className="border-slate-200 md:border-r pb-1 md:pb-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Constituency Number</span>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-tight">#{constituencyNumber}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Reservation Type</span>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-tight">{constituencyType}</p>
          </div>
        </div>
      </div>

      {/* Vote Statistics Table */}
      <div className="mb-4 break-inside-avoid">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <Vote className="h-3.5 w-3.5 text-slate-500" />
          Vote & Margin Statistics
        </h3>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-3 py-1.5 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Metric</th>
                <th className="px-3 py-1.5 font-bold text-slate-600 text-[10px] uppercase tracking-wider text-right">Value</th>
                <th className="px-3 py-1.5 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-3 py-1.5 font-medium text-slate-800">Total Votes Polled</td>
                <td className="px-3 py-1.5 font-bold text-slate-900 text-right">{statistics.totalVotesFormatted}</td>
                <td className="px-3 py-1.5 text-[10px] text-slate-500">Total valid ballots counted in this election.</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-medium text-slate-800">Winning Margin</td>
                <td className="px-3 py-1.5 font-bold text-slate-900 text-right text-emerald-700">+{statistics.marginVotesFormatted}</td>
                <td className="px-3 py-1.5 text-[10px] text-slate-500">Difference in votes between Winner and Runner-up.</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-medium text-slate-800">Margin Percentage</td>
                <td className="px-3 py-1.5 font-bold text-slate-900 text-right text-emerald-700">{statistics.marginPercentageFormatted}</td>
                <td className="px-3 py-1.5 text-[10px] text-slate-500">Margin represented as a percentage of total votes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Grid (All Candidates) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {reportData.candidates.map((candidate) => (
          <div
            key={`${candidate.rank}-${candidate.name}`}
            className="rounded-lg border-l-4 border border-slate-200 overflow-hidden bg-white shadow-xs break-inside-avoid"
            style={{ borderLeftColor: candidate.color }}
          >
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 shrink-0">
                {candidate.rank === 1 ? (
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  {candidate.rank === 1 ? "Winner" : candidate.rank === 2 ? "Runner-up" : `Rank ${candidate.rank}`}
                </span>
              </div>
              <span
                className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border text-right"
                style={{
                  backgroundColor: `${candidate.color}10`,
                  borderColor: `${candidate.color}30`,
                  color: candidate.color === "#6b7280" ? "#4b5563" : candidate.color,
                }}
                title={candidate.party}
              >
                {candidate.party}
              </span>
            </div>
            <div className="p-3 space-y-1.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{candidate.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 block leading-none">Votes Polled</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{candidate.votesFormatted}</p>
                </div>
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 block leading-none">Vote Share</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{candidate.voteSharePercentageFormatted}</p>
                </div>
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 block leading-none">EVM Votes</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{candidate.evmVotesFormatted}</p>
                </div>
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 block leading-none">Postal Votes</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{candidate.postalVotesFormatted}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer info */}
      <div className="border-t border-slate-200 pt-3 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-slate-400 uppercase tracking-widest gap-2">
        <div>
          Data Source: ECI 2019 ELECTION METRICS DATASET
        </div>
      </div>
    </div>
  );
}

/**
 * ConstituencyReportPrintPortal
 *
 * Automatically mounts a print-only container in document.body via a portal.
 * This is hidden on screen and displayed during window.print().
 */
export function ConstituencyReportPrintPortal({
  metrics,
  feature,
}: {
  metrics: ElectionMetrics | null;
  feature: GeoJSONFeature<Record<string, unknown>> | null;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  if (!mounted || !metrics) {
    return null;
  }

  const reportData = generateReportData(metrics, feature);

  return createPortal(
    <div id="printable-report-root" className="hidden print:block">
      <ConstituencyReport reportData={reportData} isPrintLayout={true} />
    </div>,
    document.body
  );
}
