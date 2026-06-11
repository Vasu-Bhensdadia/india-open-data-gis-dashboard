"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { searchElectionIndex } from "../utils/fuzzy-search";
import type { ElectionSearchIndex, SearchResult } from "../types/search.types";

export interface UseElectionSearchOptions {
  limit?: number;
  debounceMs?: number;
  minQueryLength?: number;
}

export interface UseElectionSearchResult {
  query: string;
  setQuery: (value: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  hasQuery: boolean;
  clearSearch: () => void;
}

export function useElectionSearch(
  index: ElectionSearchIndex | null,
  options: UseElectionSearchOptions = {},
): UseElectionSearchResult {
  const { limit = 12, debounceMs = 150, minQueryLength = 2 } = options;
  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const scheduleDebouncedQuery = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        setDebouncedQuery("");
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(value);
        setIsSearching(false);
      }, debounceMs);
    },
    [debounceMs],
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      scheduleDebouncedQuery(value);
    },
    [scheduleDebouncedQuery],
  );

  const results = useMemo(() => {
    if (!index || debouncedQuery.trim().length < minQueryLength) {
      return [];
    }

    return searchElectionIndex(index.entries, debouncedQuery, limit);
  }, [debouncedQuery, index, limit, minQueryLength]);

  const clearSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setQueryState("");
    setDebouncedQuery("");
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching: isSearching && query.trim().length >= minQueryLength,
    hasQuery: query.trim().length > 0,
    clearSearch,
  };
}
