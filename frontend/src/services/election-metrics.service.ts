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

function normalizeKey(stateName: string, constituencyName: string): string {
  return `${stateName.trim().toUpperCase()}|${constituencyName.trim().toUpperCase()}`;
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
    cachedMetrics = data as ElectionMetricsIndex;
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
    "Bharatiya Janata Party": "#ff6600",
    "Indian National Congress": "#0066cc",
    "Telugu Desam": "#ffaa00",
    "Yuvajana Sramika Rythu Congress Party": "#cc00cc",
    "Dravida Munnetra Kazhagam": "#000000",
    "Shiv Sena": "#ff3333",
    "Samajwadi Party": "#ff33ff",
    "Trinamool Congress": "#00cccc",
    "Communist Party of India (Marxist)": "#ff0000",
    "National Conference": "#0099ff",
    "Peoples Democratic Party": "#009900",
    "Telangana Rashtra Samithi": "#ff00ff",
  };

  return partyColorMap[partyName] ?? "#999999";
}

export function getMarginColor(marginPercentage: number): string {
  // Color scale for winner margin percentage (0-100)
  if (marginPercentage < 5) {
    return "#fee2e2"; // Very close race - light red
  }
  if (marginPercentage < 10) {
    return "#fca5a5"; // Close race - medium red
  }
  if (marginPercentage < 20) {
    return "#f97316"; // Moderate margin - orange
  }
  if (marginPercentage < 40) {
    return "#eab308"; // Strong margin - yellow
  }
  return "#22c55e"; // Very strong margin - green
}
