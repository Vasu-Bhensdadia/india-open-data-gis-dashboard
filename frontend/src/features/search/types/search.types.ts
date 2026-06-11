import type { LatLngBoundsTuple } from "@/features/maps/utils/map-bounds";
import type { GeoJSONFeature } from "@/types/geojson";

export type SearchMatchKind = "constituency" | "state" | "party" | "candidate";

export interface SearchIndexEntry {
  id: string;
  kind: SearchMatchKind;
  label: string;
  subtitle: string;
  searchText: string;
  constituencyKey: string;
  stateName: string;
  constituencyName: string;
  partyName?: string;
  candidateName?: string;
  candidateRole?: "winner" | "runner_up";
}

export interface SearchResult extends SearchIndexEntry {
  score: number;
  highlightIndexes?: readonly number[];
}

export interface ElectionSearchIndex {
  entries: SearchIndexEntry[];
  featureByKey: Map<string, GeoJSONFeature<Record<string, unknown>>>;
  stateBoundaryByKey: Map<string, LatLngBoundsTuple>;
}

export interface SearchNavigationOptions {
  zoomMap?: boolean;
}
