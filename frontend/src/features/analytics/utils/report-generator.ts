import type { ElectionMetrics } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import {
  getPartyColor,
  getPartyTone,
} from "./constituency-profile";

/**
 * Structured data representation for the Constituency Report.
 * All fields are derived directly from the election dataset and GeoJSON properties.
 * No AI-generated or hallucinated content is included.
 */
export interface ReportCandidate {
  name: string;
  party: string;
  votes: number;
  votesFormatted: string;
  evmVotes: number;
  evmVotesFormatted: string;
  postalVotes: number;
  postalVotesFormatted: string;
  voteSharePercentage: number;
  voteSharePercentageFormatted: string;
  color: string;
  tone: "blue" | "amber" | "rose" | "emerald" | "neutral";
  rank: number;
}

export interface ConstituencyReportData {
  generatedAt: string;
  constituencyName: string;
  stateName: string;
  constituencyNumber: string;
  constituencyType: string;

  winner: {
    name: string;
    party: string;
    votes: number;
    votesFormatted: string;
    evmVotes: number;
    evmVotesFormatted: string;
    postalVotes: number;
    postalVotesFormatted: string;
    voteSharePercentage: number;
    voteSharePercentageFormatted: string;
    color: string;
    tone: "blue" | "amber" | "rose" | "emerald" | "neutral";
  };

  runnerUp: {
    name: string;
    party: string;
    votes: number;
    votesFormatted: string;
    evmVotes: number;
    evmVotesFormatted: string;
    postalVotes: number;
    postalVotesFormatted: string;
    voteSharePercentage: number;
    voteSharePercentageFormatted: string;
    color: string;
    tone: "blue" | "amber" | "rose" | "emerald" | "neutral";
  };

  candidates: ReportCandidate[];

  statistics: {
    totalVotes: number;
    totalVotesFormatted: string;
    electorateSize: number | null;
    electorateSizeFormatted: string;
    turnoutPercentage: number | null;
    turnoutPercentageFormatted: string;
    marginVotes: number;
    marginVotesFormatted: string;
    marginPercentage: number;
    marginPercentageFormatted: string;
  };
}

const integerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

/**
 * Extracts constituency number from feature properties.
 */
function extractConstituencyNumber(properties?: Record<string, unknown>): string {
  if (!properties) return "N/A";
  const numberProperties = [
    "PC_NO",
    "pc_no",
    "PC_CODE",
    "pc_code",
    "PC_NUM",
    "pc_num",
    "constituency_number",
    "constituency_no",
    "constituencyNumber",
  ];
  for (const prop of numberProperties) {
    const value = properties[prop];
    if (value !== null && value !== undefined) {
      return String(value);
    }
  }
  return "N/A";
}

/**
 * Normalizes constituency type to General, Scheduled Caste, or Scheduled Tribe.
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
 * Extracts total electors / eligible voters from feature properties.
 */
function extractElectorateSize(properties?: Record<string, unknown>): number | null {
  if (!properties) return null;
  const eligibleVotersProps = ["eligible_voters", "eligibleVoters", "total_electors"];
  for (const prop of eligibleVotersProps) {
    const value = properties[prop];
    if (typeof value === "number" && value > 0) {
      return value;
    }
  }
  return null;
}

/**
 * Extracts candidate name from feature properties or metrics as fallback.
 */
function extractCandidateName(
  role: "winner" | "runner_up",
  metrics: ElectionMetrics,
  properties?: Record<string, unknown>,
): string {
  if (role === "winner") {
    if (metrics.winner_candidate?.trim()) return metrics.winner_candidate.trim();
  } else {
    if (metrics.runner_up_candidate?.trim()) return metrics.runner_up_candidate.trim();
  }

  if (!properties) return "Unknown Candidate";

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

  return "Unknown Candidate";
}

/**
 * Extracts runner up party from feature properties or metrics as fallback.
 */
function extractRunnerUpParty(metrics: ElectionMetrics, properties?: Record<string, unknown>): string {
  if (metrics.runner_up_party?.trim()) return metrics.runner_up_party.trim();
  if (!properties) return "Unknown Party";

  const partyProps = ["runner_up_party", "runnerUpParty", "party"];
  for (const prop of partyProps) {
    const value = properties[prop];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "Unknown Party";
}

/**
 * Builds and formats constituency report data from raw feature and metrics.
 */
export function generateReportData(
  metrics: ElectionMetrics,
  feature?: GeoJSONFeature<Record<string, unknown>> | null,
): ConstituencyReportData {
  const properties = feature?.properties;
  const constituencyName = metrics.constituency_name;
  const stateName = metrics.state_name;
  const constituencyNumber = extractConstituencyNumber(properties);
  const constituencyType = normalizeConstituencyType(metrics.constituency_type);

  // Candidates
  const winnerName = extractCandidateName("winner", metrics, properties);
  const winnerParty = metrics.winner_party || "Unknown Party";
  const winnerVotes = metrics.winner_votes || 0;
  const winnerShare = metrics.total_votes > 0 ? (winnerVotes / metrics.total_votes) * 100 : 0;

  const runnerUpName = extractCandidateName("runner_up", metrics, properties);
  const runnerUpParty = extractRunnerUpParty(metrics, properties);
  const runnerUpVotes = metrics.runner_up_votes || 0;
  const runnerUpShare = metrics.total_votes > 0 ? (runnerUpVotes / metrics.total_votes) * 100 : 0;

  // Candidates mapping
  const candidates: ReportCandidate[] = [];
  if (metrics.candidates && metrics.candidates.length > 0) {
    for (const c of metrics.candidates) {
      const share = metrics.total_votes > 0 ? (c.total_votes / metrics.total_votes) * 100 : 0;
      candidates.push({
        name: c.candidate_name,
        party: c.party_name,
        votes: c.total_votes,
        votesFormatted: integerFormatter.format(c.total_votes),
        evmVotes: c.evm_votes,
        evmVotesFormatted: integerFormatter.format(c.evm_votes),
        postalVotes: c.postal_votes,
        postalVotesFormatted: integerFormatter.format(c.postal_votes),
        voteSharePercentage: share,
        voteSharePercentageFormatted: percentageFormatter.format(share) + "%",
        color: getPartyColor(c.party_name),
        tone: getPartyTone(c.party_name),
        rank: c.rank,
      });
    }
  } else {
    candidates.push({
      name: winnerName,
      party: winnerParty,
      votes: winnerVotes,
      votesFormatted: integerFormatter.format(winnerVotes),
      evmVotes: 0,
      evmVotesFormatted: "N/A",
      postalVotes: 0,
      postalVotesFormatted: "N/A",
      voteSharePercentage: winnerShare,
      voteSharePercentageFormatted: percentageFormatter.format(winnerShare) + "%",
      color: getPartyColor(winnerParty),
      tone: getPartyTone(winnerParty),
      rank: 1,
    });

    if (runnerUpName !== "Unknown Candidate") {
      candidates.push({
        name: runnerUpName,
        party: runnerUpParty,
        votes: runnerUpVotes,
        votesFormatted: integerFormatter.format(runnerUpVotes),
        evmVotes: 0,
        evmVotesFormatted: "N/A",
        postalVotes: 0,
        postalVotesFormatted: "N/A",
        voteSharePercentage: runnerUpShare,
        voteSharePercentageFormatted: percentageFormatter.format(runnerUpShare) + "%",
        color: getPartyColor(runnerUpParty),
        tone: getPartyTone(runnerUpParty),
        rank: 2,
      });
    }
  }

  const winnerCandidateObj = candidates.find((c) => c.rank === 1);
  const runnerUpCandidateObj = candidates.find((c) => c.rank === 2);

  const winnerEvm = winnerCandidateObj ? winnerCandidateObj.evmVotes : 0;
  const winnerEvmFormatted = winnerCandidateObj ? winnerCandidateObj.evmVotesFormatted : "N/A";
  const winnerPostal = winnerCandidateObj ? winnerCandidateObj.postalVotes : 0;
  const winnerPostalFormatted = winnerCandidateObj ? winnerCandidateObj.postalVotesFormatted : "N/A";

  const runnerUpEvm = runnerUpCandidateObj ? runnerUpCandidateObj.evmVotes : 0;
  const runnerUpEvmFormatted = runnerUpCandidateObj ? runnerUpCandidateObj.evmVotesFormatted : "N/A";
  const runnerUpPostal = runnerUpCandidateObj ? runnerUpCandidateObj.postalVotes : 0;
  const runnerUpPostalFormatted = runnerUpCandidateObj ? runnerUpCandidateObj.postalVotesFormatted : "N/A";

  // Statistics
  const totalVotes = metrics.total_votes || 0;
  const electorateSize = extractElectorateSize(properties);
  const turnoutPercentage = electorateSize ? (totalVotes / electorateSize) * 100 : null;

  const marginVotes = metrics.winner_margin || Math.max(0, winnerVotes - runnerUpVotes);
  const marginPercentage = metrics.winner_margin_percentage || (totalVotes > 0 ? (marginVotes / totalVotes) * 100 : 0);

  return {
    generatedAt: new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    constituencyName,
    stateName,
    constituencyNumber,
    constituencyType,
    winner: {
      name: winnerName,
      party: winnerParty,
      votes: winnerVotes,
      votesFormatted: integerFormatter.format(winnerVotes),
      evmVotes: winnerEvm,
      evmVotesFormatted: winnerEvmFormatted,
      postalVotes: winnerPostal,
      postalVotesFormatted: winnerPostalFormatted,
      voteSharePercentage: winnerShare,
      voteSharePercentageFormatted: percentageFormatter.format(winnerShare) + "%",
      color: getPartyColor(winnerParty),
      tone: getPartyTone(winnerParty),
    },
    runnerUp: {
      name: runnerUpName,
      party: runnerUpParty,
      votes: runnerUpVotes,
      votesFormatted: integerFormatter.format(runnerUpVotes),
      evmVotes: runnerUpEvm,
      evmVotesFormatted: runnerUpEvmFormatted,
      postalVotes: runnerUpPostal,
      postalVotesFormatted: runnerUpPostalFormatted,
      voteSharePercentage: runnerUpShare,
      voteSharePercentageFormatted: percentageFormatter.format(runnerUpShare) + "%",
      color: getPartyColor(runnerUpParty),
      tone: getPartyTone(runnerUpParty),
    },
    candidates,
    statistics: {
      totalVotes,
      totalVotesFormatted: integerFormatter.format(totalVotes),
      electorateSize,
      electorateSizeFormatted: electorateSize ? integerFormatter.format(electorateSize) : "N/A",
      turnoutPercentage,
      turnoutPercentageFormatted: turnoutPercentage ? percentageFormatter.format(turnoutPercentage) + "%" : "N/A",
      marginVotes,
      marginVotesFormatted: integerFormatter.format(marginVotes),
      marginPercentage,
      marginPercentageFormatted: percentageFormatter.format(marginPercentage) + "%",
    },
  };
}

/**
 * Triggers the browser window print.
 */
export function printReport(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
