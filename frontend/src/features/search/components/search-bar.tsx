"use client";

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIndiaGeoJSON } from "@/features/maps/hooks/useIndiaGeoJSON";

import { useElectionSearch } from "../hooks/useElectionSearch";
import { useElectionSearchIndex } from "../hooks/useElectionSearchIndex";
import { useSearchNavigation } from "../hooks/useSearchNavigation";
import { SearchResultPanel } from "./search-result-panel";
import type { SearchResult } from "../types/search.types";

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  zoomOnSelect?: boolean;
}

export function SearchBar({
  className,
  placeholder = "Search constituencies, states, parties, candidates…",
  zoomOnSelect = true,
}: SearchBarProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data } = useIndiaGeoJSON("india_pc_2019", {
    cacheKey: "india-parliamentary-constituencies",
  });

  const { index, isLoading: isIndexLoading } = useElectionSearchIndex(data?.features ?? null);
  const { query, setQuery, results, isSearching, hasQuery, clearSearch } = useElectionSearch(index);
  const { navigateToResult } = useSearchNavigation(index);

  const highlightedIndex =
    results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigateToResult(result, { zoomMap: zoomOnSelect });
      clearSearch();
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [clearSearch, navigateToResult, zoomOnSelect],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (results.length > 0) {
          setActiveIndex((current) => (current + 1) % results.length);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (results.length > 0) {
          setActiveIndex((current) => (current - 1 + results.length) % results.length);
        }
        break;
      case "Enter":
        event.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        clearSearch();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const showPanel = isOpen && hasQuery;

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <label htmlFor={inputId} className="sr-only">
        Search election data
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />

        <Input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50/80 pl-10 pr-10 text-sm shadow-sm focus-visible:bg-white"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${inputId}-results`}
          aria-autocomplete="list"
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />

        {(isSearching || isIndexLoading) && hasQuery ? (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-zinc-400"
            aria-hidden="true"
          />
        ) : hasQuery ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Clear search"
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {showPanel ? (
        <div id={`${inputId}-results`}>
          <SearchResultPanel
            results={results}
            activeIndex={highlightedIndex}
            isLoading={isSearching || isIndexLoading}
            query={query}
            onSelect={(result) => handleSelect(result)}
            onHighlight={setActiveIndex}
          />
        </div>
      ) : null}
    </div>
  );
}
