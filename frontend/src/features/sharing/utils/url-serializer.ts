/**
 * URL serialization utilities for dashboard state.
 *
 * Converts dashboard store state ↔ URLSearchParams with:
 * - Default-value pruning (only non-default params appear in the URL)
 * - Safe parsing with fallbacks to defaults for malformed values
 * - Set<string> ↔ comma-separated string conversion
 *
 * URL Parameter Schema:
 * - metric      — ChoroplethMetricKey
 * - cid         — selected constituency ID
 * - cname       — selected constituency display name
 * - states      — comma-separated state codes
 * - statenames  — comma-separated state names (parallel to `states`)
 * - parties     — comma-separated party names
 * - vmin/vmax   — vote range filter bounds
 * - tmin/tmax   — turnout % filter bounds (0-100)
 * - mmin/mmax   — margin % filter bounds (0-100)
 * - tvmin/tvmax — total votes filter bounds
 * - wvmin/wvmax — winner votes filter bounds
 * - tab         — active analytics tab ID
 */

import type { ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import { DEFAULT_DASHBOARD_STATE } from "@/store";

// ───────────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────────

/** The subset of dashboard state that can be persisted in the URL. */
export interface DashboardUrlState {
  metric: ChoroplethMetricKey;
  selectedConstituencyId: string | null;
  selectedConstituencyName: string | null;
  stateCodes: string[];
  stateNames: string[];
  partyNames: string[];
  voteRange: { min: number; max: number; enabled: boolean };
  turnout: { min: number; max: number; enabled: boolean };
  margin: { min: number; max: number; enabled: boolean };
  totalVotes: { min: number; max: number; enabled: boolean };
  winnerVotes: { min: number; max: number; enabled: boolean };
  activeAnalyticsTab: string | null;
}

// ───────────────────────────────────────────────────────────────────────────────
// Defaults (mirrors DEFAULT_DASHBOARD_STATE)
// ───────────────────────────────────────────────────────────────────────────────

const DEFAULTS: DashboardUrlState = {
  metric: DEFAULT_DASHBOARD_STATE.choroplethMode.selectedMetricKey,
  selectedConstituencyId: null,
  selectedConstituencyName: null,
  stateCodes: [],
  stateNames: [],
  partyNames: [],
  voteRange: {
    min: DEFAULT_DASHBOARD_STATE.voteRangeFilter.min,
    max: DEFAULT_DASHBOARD_STATE.voteRangeFilter.max,
    enabled: false,
  },
  turnout: {
    min: DEFAULT_DASHBOARD_STATE.turnoutFilter.min,
    max: DEFAULT_DASHBOARD_STATE.turnoutFilter.max,
    enabled: false,
  },
  margin: {
    min: DEFAULT_DASHBOARD_STATE.marginPercentageFilter.min,
    max: DEFAULT_DASHBOARD_STATE.marginPercentageFilter.max,
    enabled: false,
  },
  totalVotes: {
    min: DEFAULT_DASHBOARD_STATE.totalVotesFilter.min,
    max: DEFAULT_DASHBOARD_STATE.totalVotesFilter.max,
    enabled: false,
  },
  winnerVotes: {
    min: DEFAULT_DASHBOARD_STATE.winnerVotesFilter.min,
    max: DEFAULT_DASHBOARD_STATE.winnerVotesFilter.max,
    enabled: false,
  },
  activeAnalyticsTab: null,
};

// Valid metric keys for safe parsing
const VALID_METRIC_KEYS: ReadonlySet<string> = new Set<ChoroplethMetricKey>([
  "boundaryOnly",
  "winningParty",
  "marginPercentage",
  "totalVotes",
]);

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

function safeInt(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function safeFloat(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ───────────────────────────────────────────────────────────────────────────────
// Serializer
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Serialize dashboard state to URLSearchParams.
 * Only writes non-default values to keep URLs short.
 */
export function serializeDashboardState(state: DashboardUrlState): URLSearchParams {
  const params = new URLSearchParams();

  // Metric
  if (state.metric !== DEFAULTS.metric) {
    params.set("metric", state.metric);
  }

  // Selected constituency
  if (state.selectedConstituencyId) {
    params.set("cid", state.selectedConstituencyId);
  }
  if (state.selectedConstituencyName) {
    params.set("cname", state.selectedConstituencyName);
  }

  // State filter
  if (state.stateCodes.length > 0) {
    params.set("states", state.stateCodes.join(","));
    params.set("statenames", state.stateNames.join(","));
  }

  // Party filter
  if (state.partyNames.length > 0) {
    params.set("parties", state.partyNames.join(","));
  }

  // Vote range
  if (state.voteRange.enabled) {
    params.set("vmin", String(state.voteRange.min));
    params.set("vmax", String(state.voteRange.max));
  }

  // Turnout
  if (state.turnout.enabled) {
    params.set("tmin", String(state.turnout.min));
    params.set("tmax", String(state.turnout.max));
  }

  // Margin
  if (state.margin.enabled) {
    params.set("mmin", String(state.margin.min));
    params.set("mmax", String(state.margin.max));
  }

  // Total votes
  if (state.totalVotes.enabled) {
    params.set("tvmin", String(state.totalVotes.min));
    params.set("tvmax", String(state.totalVotes.max));
  }

  // Winner votes
  if (state.winnerVotes.enabled) {
    params.set("wvmin", String(state.winnerVotes.min));
    params.set("wvmax", String(state.winnerVotes.max));
  }

  // Analytics tab
  if (state.activeAnalyticsTab) {
    params.set("tab", state.activeAnalyticsTab);
  }

  return params;
}

// ───────────────────────────────────────────────────────────────────────────────
// Deserializer
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Deserialize URLSearchParams into a DashboardUrlState.
 * Falls back to defaults for any missing or malformed values.
 */
export function deserializeDashboardState(params: URLSearchParams): DashboardUrlState {
  // Metric
  const rawMetric = params.get("metric");
  const metric: ChoroplethMetricKey =
    rawMetric && VALID_METRIC_KEYS.has(rawMetric)
      ? (rawMetric as ChoroplethMetricKey)
      : DEFAULTS.metric;

  // Constituency
  const selectedConstituencyId = params.get("cid") ?? null;
  const selectedConstituencyName = params.get("cname") ?? null;

  // State filter
  const stateCodes = splitCsv(params.get("states"));
  const stateNames = splitCsv(params.get("statenames"));

  // Party filter
  const partyNames = splitCsv(params.get("parties"));

  // Vote range
  const hasVoteRange = params.has("vmin") || params.has("vmax");
  const voteRange = {
    min: safeInt(params.get("vmin"), DEFAULTS.voteRange.min),
    max: safeInt(params.get("vmax"), DEFAULTS.voteRange.max),
    enabled: hasVoteRange,
  };

  // Turnout
  const hasTurnout = params.has("tmin") || params.has("tmax");
  const turnout = {
    min: safeFloat(params.get("tmin"), DEFAULTS.turnout.min),
    max: safeFloat(params.get("tmax"), DEFAULTS.turnout.max),
    enabled: hasTurnout,
  };

  // Margin
  const hasMargin = params.has("mmin") || params.has("mmax");
  const margin = {
    min: safeFloat(params.get("mmin"), DEFAULTS.margin.min),
    max: safeFloat(params.get("mmax"), DEFAULTS.margin.max),
    enabled: hasMargin,
  };

  // Total votes
  const hasTotalVotes = params.has("tvmin") || params.has("tvmax");
  const totalVotes = {
    min: safeInt(params.get("tvmin"), DEFAULTS.totalVotes.min),
    max: safeInt(params.get("tvmax"), DEFAULTS.totalVotes.max),
    enabled: hasTotalVotes,
  };

  // Winner votes
  const hasWinnerVotes = params.has("wvmin") || params.has("wvmax");
  const winnerVotes = {
    min: safeInt(params.get("wvmin"), DEFAULTS.winnerVotes.min),
    max: safeInt(params.get("wvmax"), DEFAULTS.winnerVotes.max),
    enabled: hasWinnerVotes,
  };

  // Analytics tab
  const activeAnalyticsTab = params.get("tab") ?? null;

  return {
    metric,
    selectedConstituencyId,
    selectedConstituencyName,
    stateCodes,
    stateNames,
    partyNames,
    voteRange,
    turnout,
    margin,
    totalVotes,
    winnerVotes,
    activeAnalyticsTab,
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// Comparison helpers
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Check whether two serialized URLSearchParams strings are equal.
 * Used to avoid triggering unnecessary router.replace calls.
 */
export function paramsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  return a.toString() === b.toString();
}

/**
 * Check whether a DashboardUrlState has any non-default values.
 * Useful to decide whether to bother updating the URL.
 */
export function hasNonDefaultState(state: DashboardUrlState): boolean {
  return (
    state.metric !== DEFAULTS.metric ||
    state.selectedConstituencyId !== null ||
    state.stateCodes.length > 0 ||
    state.partyNames.length > 0 ||
    state.voteRange.enabled ||
    state.turnout.enabled ||
    state.margin.enabled ||
    state.totalVotes.enabled ||
    state.winnerVotes.enabled ||
    state.activeAnalyticsTab !== null
  );
}
