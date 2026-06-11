"use client";

import { Building2, Flag, MapPin, User } from "lucide-react";

import { cn } from "@/lib/utils";

import { getSearchKindLabel } from "../utils/search-index";
import type { SearchMatchKind, SearchResult } from "../types/search.types";

const kindIcons: Record<SearchMatchKind, typeof MapPin> = {
  constituency: MapPin,
  state: Flag,
  party: Building2,
  candidate: User,
};

export interface SearchResultPanelProps {
  results: SearchResult[];
  activeIndex: number;
  isLoading?: boolean;
  query: string;
  onSelect: (result: SearchResult, index: number) => void;
  onHighlight: (index: number) => void;
  className?: string;
}

export function SearchResultPanel({
  results,
  activeIndex,
  isLoading = false,
  query,
  onSelect,
  onHighlight,
  className,
}: SearchResultPanelProps) {
  if (!query.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg ring-1 ring-black/5",
        className,
      )}
      role="listbox"
      aria-label="Search results"
    >
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-zinc-500">Searching…</div>
      ) : results.length === 0 ? (
        <div className="px-4 py-3 text-sm text-zinc-500">
          No matches for <span className="font-medium text-zinc-700">&ldquo;{query}&rdquo;</span>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.map((result, index) => {
            const Icon = kindIcons[result.kind];
            const isActive = index === activeIndex;

            return (
              <li key={result.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-emerald-50 text-emerald-950" : "hover:bg-zinc-50",
                  )}
                  onMouseEnter={() => onHighlight(index)}
                  onClick={() => onSelect(result, index)}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                      isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">
                      {result.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">
                      {result.subtitle}
                    </span>
                  </span>

                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                    {getSearchKindLabel(result.kind)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
