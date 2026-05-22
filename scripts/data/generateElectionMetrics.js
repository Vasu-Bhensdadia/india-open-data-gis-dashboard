const fs = require("fs");
const path = require("path");

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row);
  }

  return rows;
}

function normalizeKey(state, constituency) {
  return `${state.trim().toUpperCase()}|${constituency.trim().toUpperCase()}`;
}

function generateElectionMetrics() {
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
  const rows = parseCSV(csvContent);

  console.log(`Total rows in CSV: ${rows.length}`);

  // Group by constituency
  const constituencyGroups = {};

  for (const row of rows) {
    const key = normalizeKey(row.geo_state_name, row.geo_constituency_name);
    if (!constituencyGroups[key]) {
      constituencyGroups[key] = [];
    }
    constituencyGroups[key].push(row);
  }

  console.log(`Total unique constituencies: ${Object.keys(constituencyGroups).length}`);

  // Calculate metrics
  const metricsIndex = {};

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
