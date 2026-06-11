export { SearchBar } from "./components/search-bar";
export { SearchResultPanel } from "./components/search-result-panel";

export { useElectionSearch } from "./hooks/useElectionSearch";
export { useElectionSearchIndex } from "./hooks/useElectionSearchIndex";
export { useSearchNavigation } from "./hooks/useSearchNavigation";

export { applySearchResult } from "./utils/apply-search-result";
export { searchElectionIndex, createSearchDebounce } from "./utils/fuzzy-search";
export { buildElectionSearchIndex, buildFeatureLookup, getSearchKindLabel } from "./utils/search-index";
export { loadStateBoundaryIndex, normalizeStateKey } from "./utils/state-boundaries";

export type {
  ElectionSearchIndex,
  SearchIndexEntry,
  SearchMatchKind,
  SearchNavigationOptions,
  SearchResult,
} from "./types/search.types";
