/**
 * useDashboardUrlSync — bidirectional URL ↔ Zustand store synchronization.
 *
 * Responsibilities:
 * 1. RESTORE: On mount, read URLSearchParams and apply any encoded state
 *    into the dashboard store (metric, constituency, filters, tab).
 * 2. SYNC: Subscribe to Zustand store changes and update the URL via
 *    router.replace() (shallow — no navigation, no scroll reset).
 *
 * Design decisions:
 * - A `isRestoringRef` flag prevents the restore pass from immediately
 *   triggering a re-push that would overwrite the original URL.
 * - Store subscription uses `useDashboardStore.subscribe()` (outside React
 *   render) to avoid re-render overhead and debounce rapid changes.
 * - Only params that differ from defaults are written to the URL.
 */

"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useDashboardStore } from "@/store";
import {
  deserializeDashboardState,
  serializeDashboardState,
} from "../utils/url-serializer";
import type { DashboardUrlState } from "../utils/url-serializer";

/** Debounce delay (ms) before writing URL changes. Prevents flooding history on rapid slider drags. */
const URL_SYNC_DEBOUNCE_MS = 300;

// ───────────────────────────────────────────────────────────────────────────────
// Snapshot extractor — reads current store state into DashboardUrlState
// ───────────────────────────────────────────────────────────────────────────────

function extractUrlState(): DashboardUrlState {
  const s = useDashboardStore.getState();
  return {
    metric: s.choroplethMode.selectedMetricKey,
    selectedConstituencyId: s.constituencySelection.selectedConstituencyId,
    selectedConstituencyName: s.constituencySelection.selectedConstituencyName,
    stateCodes: Array.from(s.stateFilter.stateCodes),
    stateNames: Array.from(s.stateFilter.stateNames),
    partyNames: Array.from(s.partyFilter.partyNames),
    voteRange: {
      min: s.voteRangeFilter.min,
      max: s.voteRangeFilter.max,
      enabled: s.voteRangeFilter.enabled,
    },
    turnout: {
      min: s.turnoutFilter.min,
      max: s.turnoutFilter.max,
      enabled: s.turnoutFilter.enabled,
    },
    margin: {
      min: s.marginPercentageFilter.min,
      max: s.marginPercentageFilter.max,
      enabled: s.marginPercentageFilter.enabled,
    },
    totalVotes: {
      min: s.totalVotesFilter.min,
      max: s.totalVotesFilter.max,
      enabled: s.totalVotesFilter.enabled,
    },
    winnerVotes: {
      min: s.winnerVotesFilter.min,
      max: s.winnerVotesFilter.max,
      enabled: s.winnerVotesFilter.enabled,
    },
    activeAnalyticsTab: s.activeAnalyticsTab,
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// Restoration — applies URL state into store actions
// ───────────────────────────────────────────────────────────────────────────────

function applyUrlStateToStore(urlState: DashboardUrlState): void {
  const store = useDashboardStore.getState();

  // Metric
  if (urlState.metric !== store.choroplethMode.selectedMetricKey) {
    store.setChoroplethMetric(urlState.metric);
  }

  // Constituency (ID + name only — feature object restored on map click, not from URL)
  if (
    urlState.selectedConstituencyId &&
    urlState.selectedConstituencyId !== store.constituencySelection.selectedConstituencyId
  ) {
    store.selectConstituency(
      urlState.selectedConstituencyId,
      urlState.selectedConstituencyName ?? urlState.selectedConstituencyId,
      null, // GeoJSON feature not available from URL
    );
  }

  // State filter
  if (urlState.stateCodes.length > 0) {
    const codes = new Set(urlState.stateCodes);
    const names = new Set(urlState.stateNames);
    store.setStateFilter({ stateCodes: codes, stateNames: names, enabled: true });
  }

  // Party filter
  if (urlState.partyNames.length > 0) {
    store.setPartyFilter({ partyNames: new Set(urlState.partyNames), enabled: true });
  }

  // Vote range
  if (urlState.voteRange.enabled) {
    store.setVoteRangeFilter(urlState.voteRange);
  }

  // Turnout
  if (urlState.turnout.enabled) {
    store.setTurnoutFilter(urlState.turnout);
  }

  // Margin
  if (urlState.margin.enabled) {
    store.setMarginPercentageFilter(urlState.margin);
  }

  // Total votes
  if (urlState.totalVotes.enabled) {
    store.setTotalVotesFilter(urlState.totalVotes);
  }

  // Winner votes
  if (urlState.winnerVotes.enabled) {
    store.setWinnerVotesFilter(urlState.winnerVotes);
  }

  // Analytics tab
  if (urlState.activeAnalyticsTab) {
    store.setActiveAnalyticsTab(urlState.activeAnalyticsTab);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Hook
// ───────────────────────────────────────────────────────────────────────────────

export function useDashboardUrlSync(): void {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prevents restore → push → restore loop
  const isRestoringRef = useRef(false);
  // Track last pushed params string to avoid redundant replace() calls
  const lastParamsRef = useRef<string>("");

  // ── Phase 1: Restore state from URL on mount ──────────────────────────────
  useEffect(() => {
    // Only restore if the URL actually has params
    if (searchParams.size === 0) return;

    isRestoringRef.current = true;
    const urlState = deserializeDashboardState(searchParams);
    applyUrlStateToStore(urlState);

    // Allow sync to resume after a tick (after store has settled)
    const timer = setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  // ── Phase 2: Subscribe to store and push URL changes ─────────────────────
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useDashboardStore.subscribe(() => {
      // Skip while restoring to prevent overwriting URL immediately after load
      if (isRestoringRef.current) return;

      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const currentState = extractUrlState();
        const newParams = serializeDashboardState(currentState);
        const newParamsStr = newParams.toString();

        // Skip if nothing changed
        if (newParamsStr === lastParamsRef.current) return;

        lastParamsRef.current = newParamsStr;

        const newUrl = newParamsStr
          ? `${window.location.pathname}?${newParamsStr}`
          : window.location.pathname;

        router.replace(newUrl, { scroll: false });
      }, URL_SYNC_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [router]);

  // ── Phase 3: Keep lastParamsRef in sync with current URL on mount ─────────
  useEffect(() => {
    lastParamsRef.current = searchParams.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once
}
