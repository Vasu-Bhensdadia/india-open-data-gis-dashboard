# Analytics Filtering Engine

## Overview

A comprehensive, reusable filtering system for the GIS dashboard that dynamically filters GeoJSON features based on election metrics and user selections.

### Key Features

✅ **Multiple Filter Types** - Party, state, vote range, margin percentage, total votes  
✅ **Real-time Updates** - Filters sync automatically with dashboard store  
✅ **Dynamic Map Rendering** - Filtered features fade out, visible features highlighted  
✅ **Performance Optimized** - Memoized calculations and lazy metric loading  
✅ **Type-Safe** - Full TypeScript support with comprehensive types  
✅ **Extensible** - Easy to add new filter types (district, year, etc.)  
✅ **Debugging Support** - Filter snapshots, statistics, breakdowns  

## Architecture

### Components

```
Filter Engine
├── Types (filter.types.ts)
│   ├── FilterConfig
│   ├── FilterResult
│   ├── FilterStatus
│   └── DetailedFilterResult
├── Engine (filter-engine.ts)
│   ├── applyFilters()
│   ├── createFilterPredicate()
│   ├── hasActiveFilters()
│   └── getActiveFilterDescriptions()
├── Hooks (useFilterEngine.ts)
│   ├── useFilterEngine()
│   ├── useDetailedFilterEngine()
│   ├── useFilteredGeoJSON()
│   └── useFilterState()
├── Map Integration (useMapIntegration.ts)
│   ├── useMapFilteredFeatures()
│   ├── useFilteredFeatureStyle()
│   ├── useFilteredFeatureColor()
│   └── useFilterAwareSelection()
├── Utilities (filter-utils.ts)
│   ├── calculateFieldStatistics()
│   ├── extractUniqueParties()
│   ├── extractUniqueStates()
│   └── formatVoteCount()
└── Configuration (filter-config.ts)
    ├── DEFAULT_FILTER_CONFIG
    ├── PRESET_HIGH_MARGIN
    ├── PRESET_CLOSE_CONTEST
    └── Factory functions
```

## Filter Types

### 1. Political Party Filter

Filter constituencies by winning party.

```typescript
const partyFilter: FilterConfig["party"] = {
  type: "set",
  values: new Set(["Bharatiya Janata Party", "Indian National Congress"]),
  enabled: true,
};
```

**Use Cases:**
- Show only constituencies won by a specific party
- Compare performance across multiple parties
- Analyze party-specific trends

### 2. State/Constituency Filter

Filter by Indian state.

```typescript
const stateFilter: FilterConfig["state"] = {
  type: "set",
  values: new Set(["Maharashtra", "Karnataka"]),
  enabled: true,
};
```

**Use Cases:**
- Focus on specific states
- Regional analysis
- Multi-state comparisons

### 3. Margin Percentage Filter

Filter by victory margin (0-100%).

```typescript
const marginFilter: FilterConfig["marginPercentage"] = {
  type: "range",
  min: 5,
  max: 50,
  enabled: true,
};
```

**Use Cases:**
- Find close contests
- Identify safe seats
- Margin analysis

### 4. Total Votes Filter

Filter by total votes cast.

```typescript
const votesFilter: FilterConfig["totalVotes"] = {
  type: "range",
  min: 800000,
  max: 1600000,
  enabled: true,
};
```

**Use Cases:**
- Analyze high/low turnout regions
- Vote distribution analysis
- Participation patterns

### 5. Winner Votes Filter

Filter by winning candidate's vote count.

```typescript
const winnerVotesFilter: FilterConfig["winnerVotes"] = {
  type: "range",
  min: 400000,
  max: 1000000,
  enabled: true,
};
```

**Use Cases:**
- Find dominant candidates
- Analyze winning margins
- Candidate performance metrics

## Usage Examples

### Example 1: Basic Filtering

```typescript
import { useFilterEngine } from '@/features/filters';

function MapComponent({ geoJSON }) {
  const { filteredFeatures, filterStatus } = useFilterEngine(geoJSON.features);
  
  return (
    <div>
      <p>{filterStatus.matchedPercentage.toFixed(1)}% of features visible</p>
      <GeoJSONLayer features={filteredFeatures} />
    </div>
  );
}
```

### Example 2: Filter Panel Integration

```typescript
import { useDashboardStore, selectAllFilters } from '@/store';
import { useFilterEngine } from '@/features/filters';

function FilterPanel({ geoJSON }) {
  const filters = useDashboardStore(selectAllFilters);
  const { toggleStateFilter } = useDashboardStore();
  const { filterStatus } = useFilterEngine(geoJSON.features);
  
  return (
    <div>
      <h3>Filters</h3>
      {filterStatus.appliedFilters.map(desc => (
        <p key={desc}>{desc}</p>
      ))}
      
      <StateSelector onToggle={toggleStateFilter} />
      <PartySelector />
      <RangeSliders />
    </div>
  );
}
```

### Example 3: Detailed Analytics

```typescript
import { useDetailedFilterEngine } from '@/features/filters';

function AnalyticsPanel({ geoJSON }) {
  const { detailedResult, filterBreakdown } = useDetailedFilterEngine(geoJSON.features);
  
  return (
    <div>
      <p>Total Features: {detailedResult?.statistics.totalFeatures}</p>
      <p>Matched: {detailedResult?.statistics.matchedFeatures}</p>
      <p>Party Filter: {filterBreakdown?.partyFilter.passed} passed</p>
      <p>State Filter: {filterBreakdown?.stateFilter.passed} passed</p>
    </div>
  );
}
```

### Example 4: Map Integration

```typescript
import { useMapFilteredFeatures } from '@/features/filters';

function LeafletMap({ geoJSON, metricsIndex }) {
  const { visibleFeatures, filterResult } = useMapFilteredFeatures(
    geoJSON.features,
    metricsIndex
  );
  
  return (
    <MapContainer>
      <GeoJSON
        data={{ type: 'FeatureCollection', features: visibleFeatures }}
        style={(feature) => ({
          opacity: 1, // visible features
          weight: 2,
        })}
      />
      {/* Dimmed features */}
      <GeoJSON
        data={{ type: 'FeatureCollection', features: filterResult?.filteredFeatures }}
        style={(feature) => ({
          opacity: 0.15, // dimmed
          weight: 1,
        })}
      />
    </MapContainer>
  );
}
```

### Example 5: Filter Presets

```typescript
import { PRESET_HIGH_MARGIN, PRESET_CLOSE_CONTEST } from '@/features/filters/config';
import { useDashboardStore } from '@/store';

function PresetButtons() {
  const { setMarginFilter } = useDashboardStore();
  
  return (
    <div>
      <button onClick={() => {
        setMarginFilter(PRESET_HIGH_MARGIN.marginPercentage!);
      }}>
        Show High-Margin Wins
      </button>
      
      <button onClick={() => {
        setMarginFilter(PRESET_CLOSE_CONTEST.marginPercentage!);
      }}>
        Show Close Contests
      </button>
    </div>
  );
}
```

## Hooks Reference

### useFilterEngine

Main hook for applying filters to features.

```typescript
const {
  filteredFeatures,    // Features matching all filters
  filterResult,        // Detailed filter result with statistics
  filterStatus,        // Current filter status
  metricsIndex,        // Loaded election metrics
  isLoadingMetrics,    // Loading state
  metricsError,        // Any errors during loading
} = useFilterEngine(features);
```

### useFilteredGeoJSON

Get filtered GeoJSON collection directly.

```typescript
const filteredGeoJSON = useFilteredGeoJSON(geoJSON);
// Returns: GeoJSONFeatureCollection | null
```

### useMapFilteredFeatures

Get visible and hidden features for map rendering.

```typescript
const {
  visibleFeatures,     // Features that pass filters
  hiddenFeatures,      // Filtered-out features
  filterResult,        // Statistics
  featureFilterMap,    // Map<featureId, isVisible>
} = useMapFilteredFeatures(features, metricsIndex);
```

### useFilteredFeatureStyle

Get opacity and styling for a feature.

```typescript
const {
  isVisible,           // Does feature pass filters?
  opacity,             // Visual opacity (1 or 0.15)
  pointerEvents,       // Interaction state
} = useFilteredFeatureStyle(feature, metricsIndex);
```

### useFilterState

Manual filter state management (advanced).

```typescript
const {
  filters,                  // Current filter config
  updatePartyFilter,        // Update party filter
  updateStateFilter,        // Update state filter
  updateMarginFilter,       // Update margin filter
  updateTotalVotesFilter,   // Update vote filter
  updateWinnerVotesFilter,  // Update winner votes filter
  resetFilters,             // Reset to defaults
} = useFilterState();
```

## Utility Functions

### calculateFieldStatistics

Get min/max/mean/median for a field.

```typescript
const stats = calculateFieldStatistics(
  features,
  metricsIndex,
  (metrics) => metrics.total_votes
);

// Returns: { min, max, mean, median, values }
```

### extractUniqueParties

Get all parties in dataset with counts.

```typescript
const parties = extractUniqueParties(features, metricsIndex);
// Returns: [{ name: 'BJP', count: 150 }, ...]
```

### formatVoteCount

Format vote numbers readably.

```typescript
formatVoteCount(1500000); // "1.5M"
formatVoteCount(150000);  // "150K"
```

### validateRangeValues

Validate filter range.

```typescript
const result = validateRangeValues(min, max, absMin, absMax);
if (!result.valid) console.error(result.error);
```

## Integration with Dashboard Store

The filtering engine integrates with `useDashboardStore` automatically:

```typescript
// Components can update filters via store
const { 
  toggleStateFilter,
  togglePartyFilter,
  setVoteRange,
  setTurnoutRange,
} = useDashboardStore();

// Hooks read filters from store
const filters = useDashboardStore(selectAllFilters);

// Filter engine applies store filters
const { filteredFeatures } = useFilterEngine(features);
```

## Filter Flow

```
User adjusts filter (UI)
    ↓
Store action dispatched (toggleStateFilter, etc.)
    ↓
Dashboard store updated
    ↓
Hook re-computes filters (useFilterEngine)
    ↓
Memoized result returned
    ↓
Components re-render with filtered data
    ↓
Map updates visually
```

## Performance Considerations

### Memoization

All expensive operations are memoized:

```typescript
// ✅ Good: Memoized, only recalculates when dependencies change
const filterResult = useMemo(() => {
  return applyFilters(features, filters, metricsIndex);
}, [features, filters, metricsIndex]);

// ❌ Bad: Recalculates every render
const filterResult = applyFilters(features, filters, metricsIndex);
```

### Lazy Metric Loading

Election metrics loaded once and cached:

```typescript
// Loaded async, doesn't block render
const { metricsIndex, isLoadingMetrics } = useFilterEngine(features);

if (isLoadingMetrics) return <LoadingSpinner />;
```

### Feature Filtering

O(n) complexity per filter application where n = number of features.

## Testing

### Unit Test Example

```typescript
import { applyFilters } from '@/features/filters';

describe('Filter Engine', () => {
  it('should filter features by party', () => {
    const filters = {
      party: { type: 'set', values: new Set(['BJP']), enabled: true },
      // ... other filters disabled
    };
    
    const result = applyFilters(features, filters, metricsIndex);
    expect(result.passedFeatures.length).toBeLessThan(features.length);
  });
});
```

## Extending the Filter Engine

### Adding a New Filter Type

1. **Update FilterConfig type:**
```typescript
export interface FilterConfig {
  district?: SetFilterConfig;  // New filter
  // ... existing filters
}
```

2. **Update createFilterPredicate:**
```typescript
if (filters.district.enabled && filters.district.values.size > 0) {
  if (!filters.district.values.has(feature.properties.district)) {
    return false;
  }
}
```

3. **Create hook:**
```typescript
export function useDistrictFilter(features, metricsIndex) {
  // Implementation
}
```

## Future Enhancements

- ✅ Implemented: Party, state, vote ranges, margin filtering
- 📋 Planned: District-level filtering
- 📋 Planned: Year/election cycle filtering
- 📋 Planned: Custom metric filtering
- 📋 Planned: Filter save/restore presets
- 📋 Planned: Backend-driven filter values
- 📋 Planned: Advanced filter composition

## Troubleshooting

### Filters Not Applying

1. Check metrics are loaded: `isLoadingMetrics === false`
2. Verify feature properties match expected names
3. Check filter is enabled: `filter.enabled === true`

### Performance Issues

1. Profile with React DevTools
2. Check memoization dependencies
3. Verify features array isn't being recreated

### Inconsistent Results

1. Use `useDetailedFilterEngine` for breakdown
2. Check `filterBreakdown` statistics
3. Verify metrics data completeness

## API Reference

See `filter.types.ts` for complete type definitions.

## Files

- `types/filter.types.ts` - Type definitions
- `utils/filter-engine.ts` - Core filtering logic
- `utils/filter-utils.ts` - Utility functions
- `hooks/useFilterEngine.ts` - React hooks
- `hooks/useMapIntegration.ts` - Map integration
- `config/filter-config.ts` - Defaults and presets
- `index.ts` - Module exports
