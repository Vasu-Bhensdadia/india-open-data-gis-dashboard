/**
 * Constituency Profile Analytics Helpers
 *
 * Utilities for formatting and computing constituency intelligence data
 * from election metrics and GeoJSON features.
 */

import type { ElectionMetrics } from "@/services/election-metrics.service";

/**
 * Formatted constituency profile metrics for display.
 */
export interface ConstituencyProfileData {
  constituencyName: string;
  stateName: string;
  constituencyNumber: string | null;
  constituencyType: string;
  winnerCandidate: string | null;
  winnerParty: string;
  runnerUpCandidate: string | null;
  runnerUpParty: string | null;
  winnerVotes: number;
  runnerUpVotes: number;
  winningMargin: number;
  winningMarginPercentage: number;
  totalVotes: number;
  turnoutPercentage: number | null;
}

/**
 * Display-formatted constituency profile.
 */
export interface FormattedConstituencyProfile {
  constituencyName: string;
  stateName: string;
  constituencyNumber: string;
  constituencyType: string;
  winner: {
    candidate: string;
    party: string;
    votes: string;
  };
  runnerUp: {
    candidate: string;
    party: string;
    votes: string;
  };
  metrics: {
    margin: string;
    marginPercentage: string;
    totalVotes: string;
    turnout: string;
  };
}

/**
 * Numeric formatters for consistent display.
 */
const integerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
});

/**
 * Build constituency profile from election metrics and feature properties.
 * Extracts data from ElectionMetrics JSON and feature geometry metadata.
 *
 * @param metrics - Election metrics from the election_metrics.json dataset
 * @param featureProperties - GeoJSON feature properties containing constituency details
 * @returns ConstituencyProfileData with raw metrics
 */
export function buildConstituencyProfile(
  metrics: ElectionMetrics,
  featureProperties?: Record<string, unknown>,
): ConstituencyProfileData {
  return {
    constituencyName: metrics.constituency_name,
    stateName: metrics.state_name,
    constituencyNumber: extractConstituencyNumber(featureProperties),
    constituencyType: normalizeConstituencyType(metrics.constituency_type),
    winnerCandidate:
      metrics.winner_candidate?.trim() || extractCandidate(featureProperties, "winner") || null,
    winnerParty: metrics.winner_party,
    runnerUpCandidate:
      metrics.runner_up_candidate?.trim() || extractCandidate(featureProperties, "runner_up") || null,
    runnerUpParty:
      metrics.runner_up_party?.trim() || extractRunnerUpParty(featureProperties) || null,
    winnerVotes: metrics.winner_votes,
    runnerUpVotes: metrics.runner_up_votes,
    winningMargin: metrics.winner_margin,
    winningMarginPercentage: metrics.winner_margin_percentage,
    totalVotes: metrics.total_votes,
    turnoutPercentage: calculateTurnoutPercentage(
      metrics.total_votes,
      featureProperties,
    ),
  };
}

/**
 * Format a raw constituency profile for display.
 * Applies number formatting and creates display-ready strings.
 *
 * @param profile - Raw constituency profile data
 * @returns Formatted profile ready for UI rendering
 */
export function formatConstituencyProfile(
  profile: ConstituencyProfileData,
): FormattedConstituencyProfile {
  return {
    constituencyName: profile.constituencyName,
    stateName: profile.stateName,
    constituencyNumber: profile.constituencyNumber || "N/A",
    constituencyType: profile.constituencyType,
    winner: {
      candidate: profile.winnerCandidate || "Unknown",
      party: profile.winnerParty,
      votes: integerFormatter.format(profile.winnerVotes),
    },
    runnerUp: {
      candidate: profile.runnerUpCandidate || "Unknown",
      party: profile.runnerUpParty || "Unknown",
      votes: integerFormatter.format(profile.runnerUpVotes),
    },
    metrics: {
      margin: integerFormatter.format(profile.winningMargin),
      marginPercentage: percentageFormatter.format(profile.winningMarginPercentage),
      totalVotes: integerFormatter.format(profile.totalVotes),
      turnout: profile.turnoutPercentage
        ? percentageFormatter.format(profile.turnoutPercentage)
        : "N/A",
    },
  };
}

/**
 * Extract constituency number from feature properties.
 * Looks for common property names across different GeoJSON variants.
 *
 * @param properties - GeoJSON feature properties
 * @returns Constituency number or null if not found
 */
function extractConstituencyNumber(properties?: Record<string, unknown>): string | null {
  if (!properties) return null;

  const numberProperties = ["PC_NUM", "pc_num", "constituency_number", "constituencyNumber"];
  for (const prop of numberProperties) {
    const value = properties[prop];
    if (value !== null && value !== undefined) {
      return String(value);
    }
  }

  return null;
}

/**
 * Extract candidate name from feature properties.
 * Looks for winner/runner-up candidate names.
 *
 * @param properties - GeoJSON feature properties
 * @param role - "winner" or "runner_up"
 * @returns Candidate name or null if not found
 */
function extractCandidate(
  properties: Record<string, unknown> | undefined,
  role: "winner" | "runner_up",
): string | null {
  if (!properties) return null;

  const candidateProps =
    role === "winner"
      ? ["winner_candidate", "winnerCandidate", "candidate"]
      : ["runner_up_candidate", "runnerUpCandidate", "runner_up"];

  for (const prop of candidateProps) {
    const value = properties[prop];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }

  return null;
}

/**
 * Extract runner-up party from feature properties.
 * The election_metrics.json doesn't include runner-up party name,
 * so this attempts to extract from feature if available.
 *
 * @param properties - GeoJSON feature properties
 * @returns Runner-up party name or null if not found
 */
function extractRunnerUpParty(properties?: Record<string, unknown>): string | null {
  if (!properties) return null;

  const partyProps = ["runner_up_party", "runnerUpParty"];
  for (const prop of partyProps) {
    const value = properties[prop];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }

  return null;
}

/**
 * Normalize constituency type to standard display format.
 * Converts shorthand (GEN, SC, ST) to full names if needed.
 *
 * @param type - Raw constituency type from metrics
 * @returns Normalized constituency type
 */
function normalizeConstituencyType(type: string): string {
  const typeMap: Record<string, string> = {
    GEN: "General",
    SC: "Scheduled Caste",
    ST: "Scheduled Tribe",
    General: "General",
    "Scheduled Caste": "Scheduled Caste",
    "Scheduled Tribe": "Scheduled Tribe",
  };

  return typeMap[type] || type;
}

/**
 * Calculate turnout percentage if eligible votes data is available.
 * Falls back to null if data is incomplete.
 *
 * @param totalVotes - Total votes cast
 * @param properties - GeoJSON feature properties that may contain eligible voters
 * @returns Turnout percentage or null if data unavailable
 */
function calculateTurnoutPercentage(
  totalVotes: number,
  properties?: Record<string, unknown>,
): number | null {
  if (!properties) return null;

  const eligibleVotersProps = ["eligible_voters", "eligibleVoters", "total_electors"];
  for (const prop of eligibleVotersProps) {
    const value = properties[prop];
    if (typeof value === "number" && value > 0) {
      return (totalVotes / value) * 100;
    }
  }

  return null;
}

/**
 * Get party color for UI rendering.
 * Maps major Indian political parties to their official colors.
 *
 * @param partyName - Party name
 * @returns Hex color code for the party, or default gray
 */
export function getPartyColor(partyName: string): string {
  const partyColorMap: Record<string, string> = {
    "Bharatiya Janata Party": "#ff9933",
    BJP: "#ff9933",
    "Indian National Congress": "#19AAED",
    INC: "#19AAED",
    Congress: "#19AAED",
    "Telugu Desam": "#ffe200",
    TDP: "#ffe200",
    "Yuvajana Sramika Rythu Congress Party": "#1569C7",
    YSRCP: "#1569C7",
    "Dravida Munnetra Kazhagam": "#dd1100",
    DMK: "#dd1100",
    "Shiv Sena": "#ff6600",
    "Samajwadi Party": "#ff2222",
    "All India Trinamool Congress": "#20C646",
    AITC: "#20C646",
    TMC: "#20C646",
    "Communist Party of India (Marxist)": "#cc0000",
    "CPI(M)": "#cc0000",
  };

  return partyColorMap[partyName] || "#6b7280"; // Default gray for unknown parties
}

/**
 * Determine semantic color tone for a party based on category.
 * Used for card highlighting and visual emphasis.
 *
 * @param partyName - Party name
 * @returns Tone category: "blue", "amber", "rose", "emerald", or "neutral"
 */
export function getPartyTone(
  partyName: string,
): "blue" | "amber" | "rose" | "emerald" | "neutral" {
  const toneMap: Record<string, "blue" | "amber" | "rose" | "emerald" | "neutral"> = {
    "Bharatiya Janata Party": "amber",
    BJP: "amber",
    "Indian National Congress": "blue",
    INC: "blue",
    Congress: "blue",
    "Telugu Desam": "amber",
    TDP: "amber",
    "Yuvajana Sramika Rythu Congress Party": "blue",
    YSRCP: "blue",
    "Dravida Munnetra Kazhagam": "rose",
    DMK: "rose",
    "Shiv Sena": "amber",
    "Samajwadi Party": "rose",
    "All India Trinamool Congress": "emerald",
    AITC: "emerald",
    TMC: "emerald",
    "Communist Party of India (Marxist)": "rose",
    "CPI(M)": "rose",
  };

  return toneMap[partyName] || "neutral";
}
