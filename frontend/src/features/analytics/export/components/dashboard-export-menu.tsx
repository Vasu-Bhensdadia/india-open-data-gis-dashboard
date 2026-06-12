"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardExportDataset, DashboardExportFormat } from "../types";
import type { UseDashboardExportResult } from "../hooks/useDashboardExport";

interface ExportOption {
  dataset: DashboardExportDataset;
  label: string;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    dataset: "constituencies",
    label: "Filtered Constituencies",
    description: "Constituency-level rows for the current filter scope.",
  },
  {
    dataset: "party-summary",
    label: "Filtered Party Summary",
    description: "Seat counts and shares from current analytics calculations.",
  },
  {
    dataset: "state-summary",
    label: "Filtered State Summary",
    description: "Per-state aggregates for the filtered constituency set.",
  },
];

interface DashboardExportMenuProps {
  exportState: UseDashboardExportResult;
}

export function DashboardExportMenu({ exportState }: DashboardExportMenuProps) {
  const { canExport, isExporting, exportError, exportDataset } = exportState;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleExport = (dataset: DashboardExportDataset, format: DashboardExportFormat) => {
    const result = exportDataset(dataset, format);
    if (result) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canExport || isExporting}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
        Export Dashboard Data
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3">
            <div className="text-sm font-semibold text-zinc-950">Export Dashboard Data</div>
            <p className="mt-1 text-xs text-zinc-500">
              Exports respect the active filters, selected state, constituency and analytics
              calculations.
            </p>
          </div>

          <div className="space-y-2">
            {EXPORT_OPTIONS.map((option) => (
              <div
                key={option.dataset}
                className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2.5"
              >
                <div className="text-sm font-medium text-zinc-900">{option.label}</div>
                <p className="mt-0.5 text-xs text-zinc-500">{option.description}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isExporting}
                    onClick={() => handleExport(option.dataset, "csv")}
                  >
                    <FileText />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isExporting}
                    onClick={() => handleExport(option.dataset, "xlsx")}
                  >
                    <FileSpreadsheet />
                    Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {exportError ? (
            <p className="mt-3 text-xs text-rose-700">{exportError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
