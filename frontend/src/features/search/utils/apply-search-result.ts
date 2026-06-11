import { getFeatureBounds, type LatLngBoundsTuple } from "@/features/maps/utils/map-bounds";
import { normalizeKey } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";

import { normalizeStateKey } from "./state-boundaries";
import type { ElectionSearchIndex, SearchNavigationOptions, SearchResult } from "../types/search.types";

export interface ApplySearchResultActions {
  setStateFilter: (filter: { stateCodes: Set<string>; stateNames: Set<string>; enabled: boolean }) => void;
  setPartyFilter: (filter: { partyNames: Set<string>; enabled: boolean }) => void;
  syncSelectionFeature: (feature: GeoJSONFeature<Record<string, unknown>> | null) => void;
  requestMapZoom: (bounds: LatLngBoundsTuple) => void;
  requestMapReset: () => void;
  applyFilters: () => void;
}

export function applySearchResult(
  result: SearchResult,
  index: ElectionSearchIndex,
  actions: ApplySearchResultActions,
  options: SearchNavigationOptions = {},
): boolean {
  const shouldUpdateMap = options.zoomMap ?? true;
  const feature = index.featureByKey.get(result.constituencyKey) ?? null;

  switch (result.kind) {
    case "state": {
      const stateName = result.stateName;
      actions.setStateFilter({
        stateCodes: new Set([stateName]),
        stateNames: new Set([stateName]),
        enabled: true,
      });
      actions.syncSelectionFeature(null);
      actions.applyFilters();

      if (shouldUpdateMap) {
        const stateKey = normalizeStateKey(stateName);
        const bounds = index.stateBoundaryByKey.get(stateKey);
        if (bounds) {
          actions.requestMapZoom(bounds);
        }
      }
      return true;
    }

    case "party": {
      if (result.partyName) {
        actions.setPartyFilter({
          partyNames: new Set([result.partyName]),
          enabled: true,
        });
      }

      actions.syncSelectionFeature(null);
      actions.applyFilters();

      if (shouldUpdateMap) {
        actions.requestMapReset();
      }
      return true;
    }

    case "candidate":
    case "constituency": {
      if (!feature) {
        return false;
      }

      actions.syncSelectionFeature(feature);
      actions.applyFilters();

      if (shouldUpdateMap) {
        const bounds = getFeatureBounds(feature);
        if (bounds) {
          actions.requestMapZoom(bounds);
        }
      }
      return true;
    }

    default:
      return false;
  }
}

export function resolveFeatureForResult(
  result: SearchResult,
  index: ElectionSearchIndex,
): GeoJSONFeature<Record<string, unknown>> | null {
  return index.featureByKey.get(result.constituencyKey) ?? null;
}

export function resolveResultFeatureId(result: SearchResult): string {
  return result.constituencyKey || normalizeKey(result.stateName, result.constituencyName);
}
