import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface ElectionRow {
  geo_state_name: string;
  geo_constituency_name: string;
  constituency_type: string;
  party_name: string;
  candidate_name: string;
  EVM_votes: string;
  postal_votes: string;
  total_votes: string;
  rank: string;
}

interface ConstituencyMetrics {
  state_name: string;
  constituency_name: string;
  constituency_type: string;
  winner_party: string;
  winner_votes: number;
  runner_up_votes: number;
  winner_margin: number;
  winner_margin_percentage: number;
  total_votes: number;
  turnout_percentage?: number;
}

interface ElectionMetricsIndex {
  [key: string]: ConstituencyMetrics;
}

function normalizeKey(state: string, constituency: string): string {
  return `${state.trim().toUpperCase()}|${constituency.trim().toUpperCase()}`;
}

async function generateElectionMetrics() {
  const csvPath = path.resolve(
    __dirname,
    "../../datasets/raw/india/2024_election_results_geo_matched.csv"
  );
  const outputPath = path.resolve(
    __dirname,
    "../../datasets/processed/india/election_metrics.json"
  );

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read CSV file
  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse CSV
  const rows: ElectionRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ElectionRow[];

  console.log(`Total rows in CSV: ${rows.length}`);

  // Group by constituency
  const constituencyGroups: {
    [key: string]: ElectionRow[];
  } = {};

  for (const row of rows) {
    const key = normalizeKey(row.geo_state_name, row.geo_constituency_name);
    if (!constituencyGroups[key]) {
      constituencyGroups[key] = [];
    }
    constituencyGroups[key].push(row);
  }

  console.log(`Total unique constituencies: ${Object.keys(constituencyGroups).length}`);

  // Calculate metrics
  const metricsIndex: ElectionMetricsIndex = {};

  for (const [key, rows] of Object.entries(constituencyGroups)) {
    // Sort by rank (ascending) to get winner first
    const sortedRows = rows.sort((a, b) => {
      const rankA = parseInt(a.rank || "999", 10);
      const rankB = parseInt(b.rank || "999", 10);
      return rankA - rankB;
    });

    // Filter out NOTA
    const validRows = sortedRows.filter((row) => row.party_name !== "None of the Above");

    if (validRows.length < 1) {
      console.warn(`No valid candidates for: ${key}`);
      continue;
    }

    const winner = validRows[0];
    const runnerUp = validRows[1];

    const winnerVotes = parseInt(winner.total_votes || "0", 10);
    const runnerUpVotes = runnerUp ? parseInt(runnerUp.total_votes || "0", 10) : 0;
    const margin = winnerVotes - runnerUpVotes;
    const marginPercentage =
      winnerVotes > 0
        ? parseFloat(((margin / winnerVotes) * 100).toFixed(2))
        : 0;

    const totalVotes = sortedRows.reduce((sum, row) => {
      const votes = parseInt(row.total_votes || "0", 10);
      return sum + votes;
    }, 0);

    metricsIndex[key] = {
      state_name: winner.geo_state_name,
      constituency_name: winner.geo_constituency_name,
      constituency_type: winner.constituency_type,
      winner_party: winner.party_name,
      winner_votes: winnerVotes,
      runner_up_votes: runnerUpVotes,
      winner_margin: margin,
      winner_margin_percentage: marginPercentage,
      total_votes: totalVotes,
    };
  }

  // Write metrics to JSON
  fs.writeFileSync(outputPath, JSON.stringify(metricsIndex, null, 2), "utf-8");
  console.log(`Metrics file created: ${outputPath}`);
  console.log(`Total metrics generated: ${Object.keys(metricsIndex).length}`);

  return metricsIndex;
}

generateElectionMetrics().catch((error) => {
  console.error("Error generating election metrics:", error);
  process.exit(1);
});
