/**
 * Example filter panel implementation using the analytics filtering engine.
 *
 * This demonstrates how to integrate the filtering system with the dashboard.
 * It can be used as a reference for implementing the actual FilterPanel component.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { loadElectionMetrics } from "@/services/election-metrics.service";
import {
  useFilterEngine,
  extractUniqueParties,
  extractUniqueStates,
  calculateFieldStatistics,
} from "@/features/filters";
import { useDashboardStore } from "@/store";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeatureCollection } from "@/types/geojson";

/**
 * Example: Complete filter panel with all filter types.
 *
 * Usage:
 * ```
 * <IntegratedFilterPanel geoJSON={geoJSONData} />
 * ```
 */
export function IntegratedFilterPanel({
  geoJSON,
}: {
  geoJSON: GeoJSONFeatureCollection<Record<string, unknown>> | null;
}) {
  const [metricsIndex, setMetricsIndex] = useState<ElectionMetricsIndex | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Get filter actions from store
  const {
    toggleStateFilter,
    togglePartyFilter,
    setTotalVotesRange,
    setMarginRange,
    resetAllFilters,
    applyFilters,
  } = useDashboardStore();

  // Get filter results from engine
  const { filteredFeatures, filterStatus } = useFilterEngine(geoJSON?.features ?? null);

  // Load metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await loadElectionMetrics();
        setMetricsIndex(metrics);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    loadMetrics();
  }, []);

  const features = geoJSON?.features;

  // Calculate available options from data
  const partyOptions = useMemo(() => {
    if (!features || !metricsIndex) return [];
    return extractUniqueParties(features, metricsIndex)
      .slice(0, 10) // Top 10 parties
      .map((p) => ({
        value: p.name,
        label: p.name,
        count: p.count,
      }));
  }, [features, metricsIndex]);

  const stateOptions = useMemo(() => {
    if (!features) return [];
    return extractUniqueStates(features)
      .map((s) => ({
        value: s.name,
        label: s.name,
        count: s.count,
      }));
  }, [features]);

  const marginStats = useMemo(() => {
    if (!features || !metricsIndex) return null;
    return calculateFieldStatistics(
      features,
      metricsIndex,
      (m) => m.winner_margin_percentage,
    );
  }, [features, metricsIndex]);

  const voteStats = useMemo(() => {
    if (!features || !metricsIndex) return null;
    return calculateFieldStatistics(
      features,
      metricsIndex,
      (m) => m.total_votes,
    );
  }, [features, metricsIndex]);

  if (isLoadingMetrics) {
    return <div className="p-4 text-zinc-600">Loading filter options...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-zinc-900">Filters</h3>
        <p className="text-sm text-zinc-600">
          Showing {filteredFeatures?.length ?? 0} of {geoJSON?.features.length ?? 0} constituencies
        </p>
      </div>

      {/* Party Filter */}
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="font-medium text-zinc-900">Political Party</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {partyOptions.map((party) => (
            <label key={party.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={() => togglePartyFilter(party.value)}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700">
                {party.label}
                {party.count && <span className="text-xs text-zinc-500"> ({party.count})</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* State Filter */}
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="font-medium text-zinc-900">State</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stateOptions.map((state) => (
            <label key={state.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={() => toggleStateFilter(state.value, state.value)}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700">
                {state.label}
                {state.count && <span className="text-xs text-zinc-500"> ({state.count})</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Margin Filter */}
      {marginStats && (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <h4 className="font-medium text-zinc-900">Winner Margin (%)</h4>
          <p className="text-xs text-zinc-500">
            Range: {marginStats.min.toFixed(1)}% - {marginStats.max.toFixed(1)}%
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-zinc-600">Min</label>
                <input
                  type="number"
                  min={marginStats.min}
                  max={marginStats.max}
                  defaultValue={marginStats.min}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    setMarginRange(min, marginStats.max);
                  }}
                  className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-600">Max</label>
                <input
                  type="number"
                  min={marginStats.min}
                  max={marginStats.max}
                  defaultValue={marginStats.max}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    setMarginRange(marginStats.min, max);
                  }}
                  className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vote Filter */}
      {voteStats && (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <h4 className="font-medium text-zinc-900">Total Votes</h4>
          <p className="text-xs text-zinc-500">
            Range: {(voteStats.min / 1000000).toFixed(1)}M - {(voteStats.max / 1000000).toFixed(1)}M
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-zinc-600">Min</label>
                <input
                  type="number"
                  min={voteStats.min}
                  max={voteStats.max}
                  step={100000}
                  defaultValue={voteStats.min}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    setTotalVotesRange(min, voteStats.max);
                  }}
                  className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-600">Max</label>
                <input
                  type="number"
                  min={voteStats.min}
                  max={voteStats.max}
                  step={100000}
                  defaultValue={voteStats.max}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    setTotalVotesRange(voteStats.min, max);
                  }}
                  className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {filterStatus.appliedFilters.length > 0 && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-medium text-blue-900">Active Filters</h4>
          <div className="space-y-1">
            {filterStatus.appliedFilters.map((filter) => (
              <div key={filter.name} className="text-sm text-blue-800">
                • {filter.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => applyFilters()}
          className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <button
          onClick={() => resetAllFilters()}
          className="flex-1 rounded bg-zinc-200 px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-300"
        >
          Reset
        </button>
      </div>

      {/* Filter Impact */}
      {filterStatus.isFiltered && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            {filterStatus.matchedPercentage.toFixed(1)}% of constituencies visible
          </p>
          <p className="text-xs text-amber-700">
            {filterStatus.activeFilterCount} filter{filterStatus.activeFilterCount > 1 ? "s" : ""} applied
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Simple party filter component.
 */
export function SimplePartyFilter({ geoJSON }: { geoJSON: GeoJSONFeatureCollection | null }) {
  const [metricsIndex, setMetricsIndex] = useState<ElectionMetricsIndex | null>(null);
  const { togglePartyFilter } = useDashboardStore();

  useEffect(() => {
    loadElectionMetrics().then(setMetricsIndex);
  }, []);

  const features = geoJSON?.features;

  const parties = useMemo(() => {
    if (!features || !metricsIndex) return [];
    return extractUniqueParties(features, metricsIndex).slice(0, 5);
  }, [features, metricsIndex]);

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Top Parties</h4>
      {parties.map((party) => (
        <label key={party.name} className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={() => togglePartyFilter(party.name)}
            className="h-4 w-4"
          />
          <span className="text-sm">
            {party.name} ({party.count})
          </span>
        </label>
      ))}
    </div>
  );
}
