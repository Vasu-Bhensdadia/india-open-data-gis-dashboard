"use client";

import { useMemo, useCallback } from "react";
import { Filter } from "lucide-react";

import {
  useDashboardStore,
  selectStateFilter,
  selectPartyFilter,
  selectMarginPercentageFilter,
  selectTotalVotesFilter,
  selectWinnerVotesFilter,
} from "@/store";
import { useIndiaGeoJSON } from "@/features/maps/hooks/useIndiaGeoJSON";
import { useFilterEngine } from "@/features/filters/hooks/useFilterEngine";
import {
  extractUniqueParties,
  extractUniqueStates,
  calculateFieldStatistics,
  formatVoteCount,
  formatPercentage,
  formatRangeDisplay
} from "@/features/filters/utils/filter-utils";
import { MultiSelectFilter, RangeSlider, FilterReset } from "./filter-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FilterPanel() {
  const { data, loading: isFeaturesLoading, error } = useIndiaGeoJSON(
    "india_pc_2019",
    {
      cacheKey: "india-parliamentary-constituencies",
    },
  );

  const partyFilter = useDashboardStore(selectPartyFilter);
  const stateFilter = useDashboardStore(selectStateFilter);
  const marginPercentageFilter = useDashboardStore(selectMarginPercentageFilter);
  const totalVotesFilter = useDashboardStore(selectTotalVotesFilter);
  const winnerVotesFilter = useDashboardStore(selectWinnerVotesFilter);

  const setStateFilter = useDashboardStore((state) => state.setStateFilter);
  const setStateFilterEnabled = useDashboardStore((state) => state.setStateFilterEnabled);
  const setPartyFilter = useDashboardStore((state) => state.setPartyFilter);
  const setPartyFilterEnabled = useDashboardStore((state) => state.setPartyFilterEnabled);
  const setMarginRange = useDashboardStore((state) => state.setMarginRange);
  const setMarginFilterEnabled = useDashboardStore((state) => state.setMarginFilterEnabled);
  const setTotalVotesRange = useDashboardStore((state) => state.setTotalVotesRange);
  const setTotalVotesFilterEnabled = useDashboardStore((state) => state.setTotalVotesFilterEnabled);
  const setWinnerVotesRange = useDashboardStore((state) => state.setWinnerVotesRange);
  const setWinnerVotesFilterEnabled = useDashboardStore((state) => state.setWinnerVotesFilterEnabled);
  const applyFilters = useDashboardStore((state) => state.applyFilters);

  const features = data?.features;

  const {
    filteredFeatures,
    filterStatus,
    metricsIndex,
    isLoadingMetrics,
  } = useFilterEngine(features ?? null);

  const partyOptions = useMemo(
    () => {
      if (!features || !metricsIndex) return [];
      return extractUniqueParties(features, metricsIndex).map((party) => ({
        value: party.name,
        label: party.name,
        count: party.count,
      }));
    },
    [features, metricsIndex],
  );

  const stateOptions = useMemo(
    () => {
      if (!features) return [];
      return extractUniqueStates(features).map((state) => ({
        value: state.name,
        label: state.name,
        count: state.count,
        }));
    },
    [features],
  );

  const marginStats = useMemo(() => {
    if (!features || !metricsIndex) return null;
    return calculateFieldStatistics(
      features,
      metricsIndex,
      (metrics) => metrics.winner_margin_percentage ?? null,
    );
  }, [features, metricsIndex]);

  const totalVotesStats = useMemo(() => {
    if (!features || !metricsIndex) return null;
    return calculateFieldStatistics(
      features,
      metricsIndex,
      (metrics) => metrics.total_votes ?? null,
    );
  }, [features, metricsIndex]);

  const winnerVotesStats = useMemo(() => {
    if (!features || !metricsIndex) return null;
    return calculateFieldStatistics(
      features,
      metricsIndex,
      (metrics) => metrics.winner_votes ?? null,
    );
  }, [features, metricsIndex]);

  // UPDATE 2: Memoized arrays passed to RangeSliders to prevent re-renders in children components
  const marginValue = useMemo(
    () => [marginPercentageFilter.min, marginPercentageFilter.max] as [number, number],
    [marginPercentageFilter.min, marginPercentageFilter.max]
  );

  const totalVotesValue = useMemo(
    () => [totalVotesFilter.min, totalVotesFilter.max] as [number, number],
    [totalVotesFilter.min, totalVotesFilter.max]
  );

  const winnerVotesValue = useMemo(
    () => [winnerVotesFilter.min, winnerVotesFilter.max] as [number, number],
    [winnerVotesFilter.min, winnerVotesFilter.max]
  );

  // UPDATE 3: Stabilized MultiSelect handlers to avoid dependency cycle triggers
  const handlePartyChange = useCallback((selected: Set<string>) => {
    setPartyFilter({
      partyNames: selected,
      enabled: selected.size > 0,
    });
  }, [setPartyFilter]);

  const handleStateChange = useCallback((selected: Set<string>) => {
    setStateFilter({
      stateCodes: selected,
      stateNames: selected,
      enabled: selected.size > 0,
    });
  }, [setStateFilter]);

  const isReady = !isFeaturesLoading && !isLoadingMetrics && !!data?.features && !!metricsIndex;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-amber-600" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Dashboard filters</p>
              <p className="text-xs text-zinc-500">
                Apply political, state and vote-based filters to the constituency map.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterReset />
              <Button
                type="button"
                onClick={() => applyFilters()}
                variant="secondary"
                className="rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
                disabled={!filterStatus.isFiltered}
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-sm text-slate-700">
            {isReady ? (
              <span>
                Showing {filteredFeatures?.length ?? 0} of {data?.features.length ?? 0} constituencies
              </span>
            ) : (
              <span>Loading filter options...</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <MultiSelectFilter
            label="Political Party"
            description="Filter constituencies by the winning party."
            options={partyOptions}
            selectedValues={partyFilter.partyNames}
            onChange={handlePartyChange}
            onEnable={setPartyFilterEnabled}
            enabled={partyFilter.enabled}
          />

          <MultiSelectFilter
            label="State"
            description="Filter constituencies by state."
            options={stateOptions}
            selectedValues={stateFilter.stateNames}
            onChange={handleStateChange}
            onEnable={setStateFilterEnabled}
            enabled={stateFilter.enabled}
          />

          {marginStats ? (
            <RangeSlider
              label="Winner Margin %"
              description={formatRangeDisplay(marginStats.min, marginStats.max, formatPercentage)}
              minValue={marginStats.min}
              maxValue={marginStats.max}
              value={marginValue}
              onChange={setMarginRange}
              onEnable={setMarginFilterEnabled}
              enabled={marginPercentageFilter.enabled}
              step={1}
              formatter={(value) => formatPercentage(value, 1)}
            />
          ) : null}

          {totalVotesStats ? (
            <RangeSlider
              label="Total Votes"
              description={formatRangeDisplay(totalVotesStats.min, totalVotesStats.max, formatVoteCount)}
              minValue={totalVotesStats.min}
              maxValue={totalVotesStats.max}
              value={totalVotesValue}
              onChange={setTotalVotesRange}
              onEnable={setTotalVotesFilterEnabled}
              enabled={totalVotesFilter.enabled}
              step={10000}
              formatter={formatVoteCount}
            />
          ) : null}

          {winnerVotesStats ? (
            <RangeSlider
              label="Winner Votes"
              description={formatRangeDisplay(winnerVotesStats.min, winnerVotesStats.max, formatVoteCount)}
              minValue={winnerVotesStats.min}
              maxValue={winnerVotesStats.max}
              value={winnerVotesValue}
              onChange={setWinnerVotesRange}
              onEnable={setWinnerVotesFilterEnabled}
              enabled={winnerVotesFilter.enabled}
              step={10000}
              formatter={formatVoteCount}
            />
          ) : null}
        </div>

        {filterStatus.appliedFilters.length > 0 ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">Active filters</p>
            <div className="mt-2 space-y-1">
              {filterStatus.appliedFilters.map((filter) => (
                <div key={filter.name} className="rounded-full bg-white px-3 py-1 text-xs text-blue-900 shadow-sm">
                  {filter.description}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Unable to load filter metadata.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
