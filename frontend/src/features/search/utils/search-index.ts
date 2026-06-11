import { extractGeoJSONMetadataKey } from "@/features/filters/utils/filter-engine";
import {
  normalizeKey,
  type ElectionMetrics,
  type ElectionMetricsIndex,
} from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

import type { LatLngBoundsTuple } from "@/features/maps/utils/map-bounds";

import type { ElectionSearchIndex, SearchIndexEntry, SearchMatchKind } from "../types/search.types";

function normalizeSearchText(value: string): string {
  return value
    .toUpperCase()
    .replace(/\(SC\)/g, "")
    .replace(/\(ST\)/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createEntry(
  partial: Omit<SearchIndexEntry, "searchText"> & { searchTokens: string[] },
): SearchIndexEntry {
  return {
    ...partial,
    searchText: normalizeSearchText(partial.searchTokens.join(" ")),
  };
}

function addUniqueStateEntries(
  entries: SearchIndexEntry[],
  seenStates: Set<string>,
  stateName: string,
  constituencyKey: string,
  constituencyName: string,
): void {
  const normalizedState = normalizeSearchText(stateName);
  if (!normalizedState || seenStates.has(normalizedState)) {
    return;
  }

  seenStates.add(normalizedState);
  entries.push(
    createEntry({
      id: `state:${normalizedState}`,
      kind: "state",
      label: stateName,
      subtitle: "State",
      searchTokens: [stateName, "state"],
      constituencyKey,
      stateName,
      constituencyName,
    }),
  );
}

function addCandidateEntry(
  entries: SearchIndexEntry[],
  metrics: ElectionMetrics,
  constituencyKey: string,
  candidateName: string | undefined,
  partyName: string | undefined,
  role: "winner" | "runner_up",
): void {
  if (!candidateName?.trim()) {
    return;
  }

  const roleLabel = role === "winner" ? "Winner" : "Runner-up";
  entries.push(
    createEntry({
      id: `candidate:${constituencyKey}:${role}:${normalizeSearchText(candidateName)}`,
      kind: "candidate",
      label: candidateName,
      subtitle: `${roleLabel} · ${metrics.constituency_name}, ${metrics.state_name}`,
      searchTokens: [candidateName, partyName ?? "", metrics.constituency_name, metrics.state_name],
      constituencyKey,
      stateName: metrics.state_name,
      constituencyName: metrics.constituency_name,
      partyName,
      candidateName,
      candidateRole: role,
    }),
  );
}

export function buildFeatureLookup(
  features: GeoJSONFeature<Record<string, unknown>>[],
): Map<string, GeoJSONFeature<Record<string, unknown>>> {
  const featureByKey = new Map<string, GeoJSONFeature<Record<string, unknown>>>();

  for (const feature of features) {
    const { stateName, constituencyName } = extractGeoJSONMetadataKey(feature);
    const key = normalizeKey(stateName, constituencyName);
    featureByKey.set(key, feature);
  }

  return featureByKey;
}

export function buildElectionSearchIndex(
  metricsIndex: ElectionMetricsIndex,
  features: GeoJSONFeature<Record<string, unknown>>[] | null,
  stateBoundaryByKey: Map<string, LatLngBoundsTuple> = new Map(),
): ElectionSearchIndex {
  const entries: SearchIndexEntry[] = [];
  const seenStates = new Set<string>();
  const featureByKey = features ? buildFeatureLookup(features) : new Map();

  for (const metrics of Object.values(metricsIndex)) {
    const constituencyKey = normalizeKey(metrics.state_name, metrics.constituency_name);

    entries.push(
      createEntry({
        id: `constituency:${constituencyKey}`,
        kind: "constituency",
        label: metrics.constituency_name,
        subtitle: metrics.state_name,
        searchTokens: [metrics.constituency_name, metrics.state_name],
        constituencyKey,
        stateName: metrics.state_name,
        constituencyName: metrics.constituency_name,
      }),
    );

    addUniqueStateEntries(
      entries,
      seenStates,
      metrics.state_name,
      constituencyKey,
      metrics.constituency_name,
    );

    if (metrics.winner_party?.trim()) {
      entries.push(
        createEntry({
          id: `party:${constituencyKey}:winner`,
          kind: "party",
          label: metrics.winner_party,
          subtitle: `Winner · ${metrics.constituency_name}, ${metrics.state_name}`,
          searchTokens: [
            metrics.winner_party,
            metrics.constituency_name,
            metrics.state_name,
            "party",
          ],
          constituencyKey,
          stateName: metrics.state_name,
          constituencyName: metrics.constituency_name,
          partyName: metrics.winner_party,
        }),
      );
    }

    addCandidateEntry(
      entries,
      metrics,
      constituencyKey,
      metrics.winner_candidate,
      metrics.winner_party,
      "winner",
    );
    addCandidateEntry(
      entries,
      metrics,
      constituencyKey,
      metrics.runner_up_candidate,
      metrics.runner_up_party,
      "runner_up",
    );
  }

  return {
    entries,
    featureByKey,
    stateBoundaryByKey,
  };
}

export function getSearchKindLabel(kind: SearchMatchKind): string {
  switch (kind) {
    case "constituency":
      return "Constituency";
    case "state":
      return "State";
    case "party":
      return "Party";
    case "candidate":
      return "Candidate";
    default:
      return "Result";
  }
}
