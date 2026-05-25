/**
 * Reusable filter components for the analytics dashboard.
 *
 * Provides:
 * - Range slider for numeric filters
 * - Multi-select for categorical filters
 * - Filter status display
 * - Filter application controls
 */

"use client";

import { useMemo, useState } from "react";
import { useDashboardStore, selectAllFilters, selectHasActiveFilters } from "@/store";
import { useFilterDescriptions } from "../hooks/useFilterEngine";
import { applyFilters, mapDashboardFiltersToEngineConfig } from "../utils/filter-engine";
import { calculateFilterImpact } from "../utils/filter-utils";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

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
}: RangeSliderProps) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900">{label}</label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnable(e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      {description && <p className="text-xs text-zinc-500">{description}</p>}

      {enabled && (
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-zinc-600">From</label>
              <input
                type="number"
                min={minValue}
                max={maxValue}
                value={value[0]}
                onChange={(e) => onChange(Number(e.target.value), value[1])}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <p className="mt-1 text-xs text-zinc-500">{formatter(value[0])}</p>
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-600">To</label>
              <input
                type="number"
                min={minValue}
                max={maxValue}
                value={value[1]}
                onChange={(e) => onChange(value[0], Number(e.target.value))}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <p className="mt-1 text-xs text-zinc-500">{formatter(value[1])}</p>
            </div>
          </div>

          {/* Range slider visualization */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={value[0]}
            onChange={(e) => onChange(Number(e.target.value), value[1])}
            className="w-full"
          />
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={value[1]}
            onChange={(e) => onChange(value[0], Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
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

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900">{label}</label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnable(e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      {description && <p className="text-xs text-zinc-500">{description}</p>}

      {enabled && (
        <div className="space-y-2">
          {visibleOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
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
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-zinc-500">({option.count})</span>
              )}
            </label>
          ))}

          {options.length > maxVisible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {expanded ? "Show less" : `Show more (${options.length - maxVisible})`}
            </button>
          )}
        </div>
      )}
    </div>
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
    <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-sm font-medium text-zinc-900">Filter Status</div>
      <div className="space-y-1 text-sm text-zinc-600">
        <div>Total: {impact.totalFeatures} constituencies</div>
        <div>Visible: {impact.matchedFeatures} ({impact.matchPercentage.toFixed(1)}%)</div>
        <div>Filtered: {impact.filteredFeatures} ({impact.filterPercentage.toFixed(1)}%)</div>
      </div>
      {impact.filteredFeatures > 0 && (
        <p className="text-xs text-amber-600">{impact.message}</p>
      )}
    </div>
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
    <button
      onClick={handleReset}
      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
        variant === "primary"
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
      }`}
    >
      Clear All Filters
    </button>
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
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-900">Active Filters</h4>
      <div className="space-y-1">
        {descriptions.map((desc) => (
          <div key={desc} className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
            <span className="text-sm text-blue-900">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

