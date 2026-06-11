import fuzzysort from "fuzzysort";

import type { SearchIndexEntry, SearchResult } from "../types/search.types";

const DEFAULT_LIMIT = 12;
const MIN_QUERY_LENGTH = 2;

function normalizeQuery(query: string): string {
  return query
    .trim()
    .toUpperCase()
    .replace(/\(SC\)/g, "")
    .replace(/\(ST\)/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchElectionIndex(
  entries: SearchIndexEntry[],
  query: string,
  limit: number = DEFAULT_LIMIT,
): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);
  if (normalizedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const results = fuzzysort.go(normalizedQuery, entries, {
    key: "searchText",
    limit,
    threshold: -10000,
  });

  return results.map((result) => ({
    ...(result.obj as SearchIndexEntry),
    score: result.score,
    highlightIndexes: result.indexes,
  }));
}

export function createSearchDebounce(delayMs: number = 150) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounce(callback: () => void) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback();
    }, delayMs);
  };
}
