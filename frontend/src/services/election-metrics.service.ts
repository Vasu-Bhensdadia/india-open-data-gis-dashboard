export interface ElectionMetrics {
  state_name: string;
  constituency_name: string;
  constituency_type: string;
  winner_party: string;
  winner_votes: number;
  runner_up_votes: number;
  winner_margin: number;
  winner_margin_percentage: number;
  total_votes: number;
}

export interface ElectionMetricsIndex {
  [key: string]: ElectionMetrics;
}

let cachedMetrics: ElectionMetricsIndex | null = null;

// This fixes the Join issue by stripping spaces, symbols, and (SC)/(ST) tags
export function normalizeKey(stateName: string, constituencyName: string): string {
  const clean = (str: string) =>
    str.toUpperCase()
       .replace(/\(SC\)/g, "")
       .replace(/\(ST\)/g, "")
       .replace(/[^A-Z0-9]/g, ""); // removes all spaces and special characters

  return `${clean(stateName)}|${clean(constituencyName)}`;
}

export async function loadElectionMetrics(): Promise<ElectionMetricsIndex> {
  if (cachedMetrics) {
    return cachedMetrics;
  }

  try {
    const response = await fetch("/data/election_metrics.json");
    if (!response.ok) {
      throw new Error(`Failed to load election metrics: ${response.statusText}`);
    }

    const data = await response.json();
    const index: ElectionMetricsIndex = {};

    // Re-index the dictionary using our bulletproof normalized key
    for (const [_key, value] of Object.entries(data)) {
      const item = value as ElectionMetrics;
      if (item.state_name && item.constituency_name) {
        const superCleanKey = normalizeKey(item.state_name, item.constituency_name);
        index[superCleanKey] = item;
      }
    }

    cachedMetrics = index;
    console.log(
      `Election metrics loaded: ${Object.keys(cachedMetrics ?? {}).length} constituencies`,
    );
    return cachedMetrics ?? {};
  } catch (error) {
    console.error("Error loading election metrics:", error);
    return {};
  }
}

export function getElectionMetrics(
  stateName: string,
  constituencyName: string,
  metricsIndex: ElectionMetricsIndex,
): ElectionMetrics | null {
  const key = normalizeKey(stateName, constituencyName);
  return metricsIndex[key] ?? null;
}

export function getPartyColor(partyName: string): string {
  const partyColorMap: Record<string, string> = {
    "Bharatiya Janata Party": "#ff9933",
    "Indian National Congress": "#19AAED",
    "Telugu Desam": "#ffe200",
    "Yuvajana Sramika Rythu Congress Party": "#1569C7",
    "Dravida Munnetra Kazhagam": "#dd1100",
    "Shiv Sena": "#ff6600",
    "Samajwadi Party": "#ff2222",
    "All India Trinamool Congress": "#20C646",
    "Communist Party of India (Marxist)": "#cc0000",
  };
  return partyColorMap[partyName] ?? "#9ca3af"; // Default gray for others
}
