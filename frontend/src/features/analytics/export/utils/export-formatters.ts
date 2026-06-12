import * as XLSX from "xlsx";

import type {
  DashboardExportFormat,
  DashboardExportSheet,
  ExportCellValue,
  ExportRow,
} from "../types";

function escapeCsvCell(value: ExportCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function collectHeaders(rows: ExportRow[]): string[] {
  const headers = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headers.add(key);
    }
  }

  return Array.from(headers);
}

export function rowsToCsv(rows: ExportRow[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = collectHeaders(rows);
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header] ?? null)).join(",")),
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function rowsToWorkbookSheet(rows: ExportRow[]): XLSX.WorkSheet {
  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([]);
  }

  return XLSX.utils.json_to_sheet(rows, {
    skipHeader: false,
  });
}

export function rowsToWorkbook(rows: ExportRow[], sheetName = "Data"): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, rowsToWorkbookSheet(rows), sheetName.slice(0, 31));
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function sheetsToWorkbook(sheets: DashboardExportSheet[]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(
      workbook,
      rowsToWorkbookSheet(sheet.rows),
      sheet.name.slice(0, 31),
    );
  }

  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function getMimeType(format: DashboardExportFormat): string {
  return format === "csv"
    ? "text/csv;charset=utf-8;"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

export function getFileExtension(format: DashboardExportFormat): string {
  return format === "csv" ? "csv" : "xlsx";
}

export function triggerBrowserDownload(
  content: string | ArrayBuffer,
  filename: string,
  format: DashboardExportFormat,
): void {
  const mimeType = getMimeType(format);
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildTimestampToken(isoDate: string): string {
  return isoDate.replace(/[:.]/g, "-");
}
