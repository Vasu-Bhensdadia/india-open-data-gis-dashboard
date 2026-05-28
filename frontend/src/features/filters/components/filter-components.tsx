"use client";

import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useDashboardStore, selectAllFilters, selectHasActiveFilters } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilterDescriptions } from "../hooks/useFilterEngine";
import { applyFilters, mapDashboardFiltersToEngineConfig } from "../utils/filter-engine";
import { calculateFilterImpact } from "../utils/filter-utils";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

function FilterShell({
  label,
  description,
  rightSlot,
  children,
  className,
}: {
  label: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-950">{label}</h3>
          {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Range slider filter component.
 * Displays min/max range with slider controls.
 */
export interface RangeSliderProps {
  label: string;
  description?: string;
  minValue: number;
  maxValue: number;
  value: [number, number];
  onChange: (min: number, max: number) => void;
  onEnable: (enabled: boolean) => void;
  enabled: boolean;
  step?: number;
  formatter?: (value: number) => string;
  hideSliderTrack?: boolean;
}

export function RangeSlider({
  label,
  description,
  minValue,
  maxValue,
  value,
  onChange,
  onEnable,
  enabled,
  step = 1,
  formatter = (v) => v.toString(),
  hideSliderTrack = false,
}: RangeSliderProps) {
  const rangeLabel = `${formatter(value[0])} - ${formatter(value[1])}`;

  return (
    <FilterShell
      label={label}
      description={description}
      rightSlot={
        <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
              enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500",
            )}
          >
            {enabled ? "Active" : "Off"}
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnable(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          />
        </label>
      }
    >
      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>Selected range</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
              {rangeLabel}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-600">From</label>
              <input
                type="number"
                min={minValue}
                max={maxValue}
                value={value[0]}
                onChange={(e) => onChange(Number(e.target.value), value[1])}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-zinc-500">{formatter(value[0])}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">To</label>
              <input
                type="number"
                min={minValue}
                max={maxValue}
                value={value[1]}
                onChange={(e) => onChange(value[0], Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-zinc-500">{formatter(value[1])}</p>
            </div>
          </div>

          {!hideSliderTrack ? (
            <div className="space-y-2">
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={step}
                value={value[0]}
                onChange={(e) => onChange(Number(e.target.value), value[1])}
                className="w-full accent-emerald-600"
              />
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={step}
                value={value[1]}
                onChange={(e) => onChange(value[0], Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
          Enable this filter to narrow the dashboard scope.
        </div>
      )}
    </FilterShell>
  );
}

/**
 * Multi-select filter component for categorical values.
 */
export interface MultiSelectFilterProps {
  label: string;
  description?: string;
  options: Array<{ value: string; label: string; count?: number }>;
  selectedValues: Set<string>;
  onChange: (selected: Set<string>) => void;
  onEnable: (enabled: boolean) => void;
  enabled: boolean;
  maxVisible?: number;
}

export function MultiSelectFilter({
  label,
  description,
  options,
  selectedValues,
  onChange,
  onEnable,
  enabled,
  maxVisible = 5,
}: MultiSelectFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded ? options : options.slice(0, maxVisible);
  const selectedCount = selectedValues.size;

  return (
    <FilterShell
      label={label}
      description={description}
      rightSlot={
        <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
              enabled ? "bg-sky-50 text-sky-700" : "bg-zinc-100 text-zinc-500",
            )}
          >
            {selectedCount} selected
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnable(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-600"
          />
        </label>
      }
    >
      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>Available options</span>
            <span>{selectedCount} of {options.length} chosen</span>
          </div>

          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                    selectedValues.has(option.value)
                      ? "border-sky-200 bg-sky-50/70"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.has(option.value)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedValues);
                      if (e.target.checked) {
                        newSelected.add(option.value);
                      } else {
                        newSelected.delete(option.value);
                      }
                      onChange(newSelected);
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-600"
                  />
                  <span className="min-w-0 flex-1 text-sm text-zinc-800">{option.label}</span>
                  {option.count !== undefined ? (
                    <span className="shrink-0 text-xs text-zinc-500">({option.count})</span>
                  ) : null}
                </label>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
                No options are available in the current dataset.
              </div>
            )}
          </div>

          {options.length > maxVisible ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 transition hover:text-sky-800"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show more ({options.length - maxVisible})
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
          Enable this filter to inspect the categorical options.
        </div>
      )}
    </FilterShell>
  );
}

/**
 * Single-select filter component for categorical values.
 * Renders as a dropdown to enforce a single choice.
 */
export interface SingleSelectFilterProps {
  label: string;
  description?: string;
  options: Array<{ value: string; label: string; count?: number }>;
  selectedValues: Set<string>;
  onChange: (selected: Set<string>) => void;
  onEnable: (enabled: boolean) => void;
  enabled: boolean;
}

export function SingleSelectFilter({
  label,
  description,
  options,
  selectedValues,
  onChange,
  onEnable,
  enabled,
}: SingleSelectFilterProps) {
  const currentValue = selectedValues.size > 0 ? Array.from(selectedValues)[0] : "";

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(new Set());
    } else {
      onChange(new Set([val]));
    }
  };

  return (
    <FilterShell
      label={label}
      description={description}
      rightSlot={
        <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
              enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500",
            )}
          >
            {enabled ? "Single select" : "Off"}
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnable(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          />
        </label>
      }
    >
      {enabled ? (
        <div className="space-y-2">
          <select
            value={currentValue}
            onChange={handleSelectChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="" className="text-zinc-900">
              All options
            </option>
            {options.map((option, index) => (
              <option
                key={option.value ?? `${option.label}-${index}`}
                value={option.value}
                className="text-zinc-900"
              >
                {option.label} {option.count !== undefined ? `(${option.count})` : ""}
              </option>
            ))}
          </select>

          <p className="text-xs text-zinc-500">Only one value can stay active at a time.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
          Turn this control on to pick a single category.
        </div>
      )}
    </FilterShell>
  );
}

/**
 * Filter status display component.
 */
export interface FilterStatusProps {
  features: GeoJSONFeature<Record<string, unknown>>[] | null;
  metricsIndex: ElectionMetricsIndex | null;
}

export function FilterStatus({ features, metricsIndex }: FilterStatusProps) {
  const filters = useDashboardStore(selectAllFilters);
  const engineFilters = mapDashboardFiltersToEngineConfig(filters);

  const impact = useMemo(() => {
    if (!features || !metricsIndex) {
      return {
        totalFeatures: 0,
        matchedFeatures: 0,
        filteredFeatures: 0,
        matchPercentage: 100,
        filterPercentage: 0,
        message: "No data",
      };
    }

    const result = applyFilters(features, engineFilters, metricsIndex);

    return calculateFilterImpact(
      result.statistics.totalFeatures,
      result.statistics.filteredOutCount,
    );
  }, [features, metricsIndex, engineFilters]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-zinc-950">Filter status</h4>
          <p className="mt-1 text-xs text-zinc-500">Live scope for the current dashboard view.</p>
        </div>
        <div className="text-right text-xs font-medium text-zinc-500">
          {impact.filteredFeatures > 0 ? "Filtered scope" : "Full scope"}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Total</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950">
              {impact.totalFeatures.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Visible</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950">
              {impact.matchedFeatures.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Filtered</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950">
              {impact.filteredFeatures.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>Visibility ratio</span>
            <span>{impact.matchPercentage.toFixed(1)}% visible</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, impact.matchPercentage))}%` }}
            />
          </div>
        </div>

        {impact.filteredFeatures > 0 ? (
          <p className="text-xs text-amber-700">{impact.message}</p>
        ) : (
          <p className="text-xs text-zinc-500">No filters are narrowing the dataset right now.</p>
        )}
      </div>
    </section>
  );
}

/**
 * Filter reset button component.
 */
export interface FilterResetProps {
  onReset?: () => void;
  variant?: "primary" | "secondary";
}

export function FilterReset({ onReset, variant = "secondary" }: FilterResetProps) {
  const resetAllFilters = useDashboardStore((state) => state.resetAllFilters);
  const hasActiveFilters = useDashboardStore(selectHasActiveFilters);

  if (!hasActiveFilters) return null;

  const handleReset = () => {
    resetAllFilters();
    onReset?.();
  };

  return (
    <Button
      type="button"
      onClick={handleReset}
      variant={variant === "primary" ? "destructive" : "secondary"}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-none transition-all duration-200",
        variant === "primary"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
      )}
    >
      <RotateCcw className="h-4 w-4" />
      Clear all filters
    </Button>
  );
}

/**
 * Applied filters display component.
 */
export function AppliedFilters() {
  const descriptions = useFilterDescriptions();

  if (descriptions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-blue-950">Active filters</h4>
          <p className="mt-1 text-xs text-blue-800/80">The dashboard is currently narrowed to:</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {descriptions.map((desc) => (
          <div
            key={desc}
            className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-900 transition-colors hover:bg-blue-50"
          >
            {desc}
          </div>
        ))}
      </div>
    </section>
  );
}
