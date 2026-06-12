import { extractGeoJSONMetadataKey } from "@/features/filters/utils/filter-engine";
import { getElectionMetrics } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import { buildConstituencyProfile } from "../../utils/constituency-profile";
import type { AnalyticsChartModel } from "../../charts/types";
import type { PartySeatCount } from "../../types/analytics.types";
import type {
  DashboardExportContext,
  DashboardExportDataset,
  DashboardExportPayload,
  DashboardExportSheet,
  ExportRow,
} from "../types";

function roundTo(value: number | null, digits = 2): number | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatMetricValue(
  rawValue: string | number | null | undefined,
): string | number | null {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  return rawValue;
}



export function buildConstituencyExportRows(
  features: GeoJSONFeature<Record<string, unknown>>[],
  metricsIndex: DashboardExportContext["metricsIndex"],
  selectedMetric: DashboardExportContext["selectedMetric"],
): ExportRow[] {
  return features.map((feature) => {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);
    const properties = feature.properties ?? {};
    const selectedMetricRawValue = selectedMetric?.extractValue(feature) ?? null;
    const selectedMetricValue = selectedMetric
      ? selectedMetric.formatValue(selectedMetricRawValue)
      : null;

    const constituencyNumber =
      properties.PC_NO ??
      properties.pc_no ??
      properties.PC_CODE ??
      properties.pc_code ??
      properties.PC_NUM ??
      properties.pc_num ??
      properties.constituency_number ??
      properties.constituency_no ??
      null;

    if (!metrics) {
      return {
        state_name: stateName,
        constituency_name: constituencyName,
        constituency_number:
          constituencyNumber === null || constituencyNumber === undefined
            ? null
            : String(constituencyNumber),
        constituency_type: null,
        winner_candidate: null,
        winner_party: null,
        runner_up_candidate: null,
        runner_up_party: null,
        winner_votes: null,
        runner_up_votes: null,
        winner_margin: null,
        winner_margin_percentage: null,
        total_votes: null,
        selected_metric_label: selectedMetric?.label ?? null,
        selected_metric_value: selectedMetricValue,
      };
    }

    const profile = buildConstituencyProfile(metrics, properties);

    return {
      state_name: profile.stateName,
      constituency_name: profile.constituencyName,
      constituency_number: profile.constituencyNumber,
      constituency_type: profile.constituencyType,
      winner_candidate: profile.winnerCandidate,
      winner_party: profile.winnerParty,
      runner_up_candidate: profile.runnerUpCandidate,
      runner_up_party: profile.runnerUpParty,
      winner_votes: profile.winnerVotes,
      runner_up_votes: profile.runnerUpVotes,
      winner_margin: profile.winningMargin,
      winner_margin_percentage: roundTo(profile.winningMarginPercentage),
      total_votes: profile.totalVotes,
      selected_metric_label: selectedMetric?.label ?? null,
      selected_metric_value: selectedMetricValue,
    };
  });
}

export function buildPartySummaryRows(partySeatCounts: PartySeatCount[]): ExportRow[] {
  return partySeatCounts.map((party, index) => ({
    rank: index + 1,
    party_name: party.partyName,
    seat_count: party.seatCount,
    seat_share_percentage: roundTo(party.sharePercentage),
  }));
}

interface StateAccumulator {
  stateName: string;
  constituencyCount: number;
  metricsMatchedCount: number;
  totalVotes: number;
  marginTotal: number;
  marginCount: number;
  partyCounts: Map<string, number>;
}

function getLeadingParty(partyCounts: Map<string, number>): {
  partyName: string | null;
  seatCount: number | null;
} {
  const [leadingParty, leadingCount] = Array.from(partyCounts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0] ?? [null, 0];

  return {
    partyName: leadingParty,
    seatCount: leadingParty ? leadingCount : null,
  };
}

export function buildStateSummaryRows(
  features: GeoJSONFeature<Record<string, unknown>>[],
  metricsIndex: DashboardExportContext["metricsIndex"],
): ExportRow[] {
  const stateMap = new Map<string, StateAccumulator>();

  for (const feature of features) {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const metrics = getElectionMetrics(stateName, constituencyName, metricsIndex);

    const accumulator =
      stateMap.get(stateName) ??
      ({
        stateName,
        constituencyCount: 0,
        metricsMatchedCount: 0,
        totalVotes: 0,
        marginTotal: 0,
        marginCount: 0,
        partyCounts: new Map<string, number>(),
      } satisfies StateAccumulator);

    accumulator.constituencyCount += 1;

    if (metrics) {
      accumulator.metricsMatchedCount += 1;
      accumulator.totalVotes += metrics.total_votes ?? 0;

      if (Number.isFinite(metrics.winner_margin_percentage)) {
        accumulator.marginTotal += metrics.winner_margin_percentage;
        accumulator.marginCount += 1;
      }

      if (metrics.winner_party) {
        accumulator.partyCounts.set(
          metrics.winner_party,
          (accumulator.partyCounts.get(metrics.winner_party) ?? 0) + 1,
        );
      }
    }

    stateMap.set(stateName, accumulator);
  }

  return Array.from(stateMap.values())
    .sort((a, b) => a.stateName.localeCompare(b.stateName))
    .map((state) => {
      const leadingParty = getLeadingParty(state.partyCounts);

      return {
        state_name: state.stateName,
        constituency_count: state.constituencyCount,
        metrics_matched_count: state.metricsMatchedCount,
        total_votes: state.totalVotes,
        average_winning_margin_percentage:
          state.marginCount > 0 ? roundTo(state.marginTotal / state.marginCount) : null,
        leading_party: leadingParty.partyName,
        leading_party_seats: leadingParty.seatCount,
      };
    });
}

function chartDatumToRow(datum: Record<string, unknown>): ExportRow {
  const row: ExportRow = {};

  for (const [key, value] of Object.entries(datum)) {
    row[key] = formatMetricValue(value as string | number | null | undefined);
  }

  return row;
}

export function buildChartExportSheets(chartModels: AnalyticsChartModel[]): DashboardExportSheet[] {
  return chartModels.map((chart) => ({
    name: chart.title.slice(0, 31),
    rows: chart.data.map((datum) => chartDatumToRow(datum as unknown as Record<string, unknown>)),
  }));
}

export function buildDashboardExportPayload(context: DashboardExportContext): DashboardExportPayload {
  return {
    generatedAt: context.summary.generatedAt,
    constituencies: buildConstituencyExportRows(
      context.filteredFeatures,
      context.metricsIndex,
      context.selectedMetric,
    ),
    partySummary: buildPartySummaryRows(context.summary.partySeatCounts),
    stateSummary: buildStateSummaryRows(context.filteredFeatures, context.metricsIndex),
    chartSheets: buildChartExportSheets(context.chartModels),
  };
}

export function getRowsForDataset(
  payload: DashboardExportPayload,
  dataset: DashboardExportDataset,
): ExportRow[] {
  switch (dataset) {
    case "constituencies":
      return payload.constituencies;
    case "party-summary":
      return payload.partySummary;
    case "state-summary":
      return payload.stateSummary;
    default:
      return [];
  }
}

export function getDatasetLabel(dataset: DashboardExportDataset): string {
  switch (dataset) {
    case "constituencies":
      return "constituencies";
    case "party-summary":
      return "party-summary";
    case "state-summary":
      return "state-summary";
    default:
      return "dashboard-export";
  }
}
