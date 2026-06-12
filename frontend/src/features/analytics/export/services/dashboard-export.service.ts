import {
  buildDashboardExportPayload,
  getDatasetLabel,
  getRowsForDataset,
} from "../utils/dataset-transformers";
import {
  buildTimestampToken,
  getFileExtension,
  rowsToCsv,
  rowsToWorkbook,
  triggerBrowserDownload,
} from "../utils/export-formatters";
import type {
  DashboardExportContext,
  DashboardExportDataset,
  DashboardExportFormat,
  DashboardExportResult,
} from "../types";

function buildFilename(
  dataset: DashboardExportDataset,
  format: DashboardExportFormat,
  generatedAt: string,
): string {
  const timestamp = buildTimestampToken(generatedAt);
  const label = getDatasetLabel(dataset);
  const extension = getFileExtension(format);
  return `election-analytics-${label}-${timestamp}.${extension}`;
}

export function exportDashboardDataset(
  context: DashboardExportContext,
  dataset: DashboardExportDataset,
  format: DashboardExportFormat,
): DashboardExportResult {
  const payload = buildDashboardExportPayload(context);
  const filename = buildFilename(dataset, format, payload.generatedAt);

  const rows = getRowsForDataset(payload, dataset);

  if (format === "csv") {
    triggerBrowserDownload(rowsToCsv(rows), filename, "csv");
  } else {
    const sheetNames: Record<DashboardExportDataset, string> = {
      constituencies: "Constituencies",
      "party-summary": "Party Summary",
      "state-summary": "State Summary",
    };

    triggerBrowserDownload(rowsToWorkbook(rows, sheetNames[dataset]), filename, "xlsx");
  }

  return { filename, format, dataset };
}

export function canExportDashboard(context: DashboardExportContext | null): boolean {
  return Boolean(
    context?.summary &&
      context.filteredFeatures &&
      context.metricsIndex &&
      context.summary.totalConstituencies >= 0,
  );
}
