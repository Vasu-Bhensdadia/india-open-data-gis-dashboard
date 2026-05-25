# Dashboard Store Usage Guide

## Overview

The dashboard store (`useDashboardStore`) is a centralized Zustand state management solution for the GIS dashboard. It manages:

- **Map interactions** (hover, select, zoom)
- **Constituency selection** (selected/hovered states)
- **Visualization settings** (choropleth metric selection)
- **Filters** (state, party, vote range, turnout)
- **UI state** (panel visibility, active tabs)

## Architecture

### Store Structure

```
DashboardStore
├── constituencySelection (selected/hovered constituency)
├── Map State
│   ├── hoveredFeature
│   ├── selectedFeature
│   ├── activeRegionMetadata
│   └── mapInteraction
├── Visualization
│   ├── choroplethMode
│   └── metricConfig
└── Filters
    ├── stateFilter
    ├── partyFilter
    ├── voteRangeFilter
    └── turnoutFilter
└── UI State
    ├── isFilterPanelOpen
    ├── isAnalyticsPanelOpen
    └── activeAnalyticsTab
```

### Key Features

- **Scalable**: Designed to support future analytics, charts, and backend integration
- **Efficient**: Uses Zustand selectors to prevent unnecessary re-renders
- **Type-safe**: Full TypeScript support with comprehensive types
- **Modular**: Feature-based selectors keep code organized
- **Backward-compatible**: Integrates with existing map interaction hooks

## Usage Patterns

### 1. Reading State with Selectors

Selectors are the preferred way to access state. They enable Zustand to optimize re-renders.

```typescript
import { useDashboardStore, selectSelectedConstituency } from '@/store';

function MyComponent() {
  // Single selector - most efficient
  const constituency = useDashboardStore(selectSelectedConstituency);
  
  return <div>{constituency.name}</div>;
}
```

**Why use selectors?**
- Zustand only re-renders when that specific value changes
- Avoids re-rendering entire component if other state changes
- More readable and maintainable

### 2. Reading Multiple Related Values

Group related selectors for clarity:

```typescript
function FilterPanel() {
  const stateFilterNames = useDashboardStore(selectStateFilterNames);
  const isStateFilterEnabled = useDashboardStore(selectIsStateFilterEnabled);
  const stateFilterCount = useDashboardStore(selectStateFilterCount);
  
  return (
    <div>
      {isStateFilterEnabled && (
        <p>{stateFilterCount} states selected</p>
      )}
    </div>
  );
}
```

### 3. Using Combined Selectors

For better performance when reading multiple categories:

```typescript
function Dashboard() {
  // Get all UI state in one call
  const uiState = useDashboardStore(selectUIState);
  
  // Get all filter state in one call
  const filters = useDashboardStore(selectAllFilters);
  
  return (
    <>
      {uiState.isFilterPanelOpen && <FilterPanel filters={filters} />}
    </>
  );
}
```

### 4. Dispatching Actions

Access actions from the store:

```typescript
function MapComponent() {
  const { selectConstituency, hoverConstituency } = useDashboardStore();
  
  const handleConstituencyClick = (feature) => {
    selectConstituency(
      feature.id,
      feature.properties.name,
      feature,
      { level: 'constituency' }
    );
  };
  
  const handleConstituencyHover = (feature) => {
    hoverConstituency(
      feature.id,
      feature.properties.name,
      feature
    );
  };
  
  return <LeafletMap onClick={handleConstituencyClick} />;
}
```

### 5. Batch Operations

Reset filters or entire dashboard state:

```typescript
function FilterPanel() {
  const { resetAllFilters, applyFilters } = useDashboardStore();
  
  return (
    <>
      <button onClick={resetAllFilters}>Clear All Filters</button>
      <button onClick={applyFilters}>Apply Filters</button>
    </>
  );
}
```

### 6. Creating Custom Derived Selectors

For component-specific logic:

```typescript
import { useDashboardStore } from '@/store';

// Component-level derived selector
function PartyFilterComponent() {
  const isPartyFiltered = useDashboardStore(state =>
    state.partyFilter.partyNames.has('Bharatiya Janata Party')
  );
  
  return <div>{isPartyFiltered ? 'BJP Selected' : 'BJP Not Selected'}</div>;
}
```

## Common Use Cases

### Use Case 1: Update Choropleth Metric

```typescript
function MetricSelector() {
  const { setChoroplethMetric } = useDashboardStore();
  
  const handleMetricChange = (metricKey) => {
    setChoroplethMetric(metricKey);
    // Map automatically re-renders with new metric
  };
  
  return (
    <select onChange={(e) => handleMetricChange(e.target.value)}>
      <option value="boundaryOnly">Show Boundaries</option>
      <option value="winningParty">Winning Party</option>
      <option value="marginPercentage">Victory Margin %</option>
      <option value="totalVotes">Total Votes</option>
    </select>
  );
}
```

### Use Case 2: Apply Multiple Filters

```typescript
function FilterPanel() {
  const {
    toggleStateFilter,
    togglePartyFilter,
    setVoteRange,
    applyFilters
  } = useDashboardStore();
  
  const handleApplyFilters = () => {
    // User selects states
    toggleStateFilter('MH', 'Maharashtra');
    toggleStateFilter('KA', 'Karnataka');
    
    // User selects parties
    togglePartyFilter('Bharatiya Janata Party');
    
    // User sets vote range
    setVoteRange(100000, 5000000);
    
    // Apply all filters
    applyFilters();
  };
  
  return <button onClick={handleApplyFilters}>Apply Filters</button>;
}
```

### Use Case 3: Sync Map with Selection

```typescript
function MapComponent() {
  const selectedFeature = useDashboardStore(selectSelectedFeature);
  const selectedMetric = useDashboardStore(selectActiveMetricDescriptor);
  const { selectConstituency } = useDashboardStore();
  
  useEffect(() => {
    if (selectedFeature && selectedMetric) {
      // Zoom to selected feature
      // Highlight in map
      // Update info panel
    }
  }, [selectedFeature, selectedMetric]);
  
  return <LeafletMap feature={selectedFeature} metric={selectedMetric} />;
}
```

### Use Case 4: Build Analytics Query

```typescript
function AnalyticsPanel() {
  const filtersSnapshot = useDashboardStore(selectFiltersSnapshot);
  const selectedMetric = useDashboardStore(selectSelectedMetricKey);
  
  // Use filtersSnapshot to construct backend query
  const queryParams = {
    metric: selectedMetric,
    filters: filtersSnapshot,
    includeCharts: true
  };
  
  useEffect(() => {
    fetchAnalytics(queryParams);
  }, [filtersSnapshot, selectedMetric]);
  
  return <div>Analytics here</div>;
}
```

## Performance Best Practices

### ✅ DO

```typescript
// Good: Using specific selectors
const name = useDashboardStore(selectSelectedConstituencyName);
const metric = useDashboardStore(selectSelectedMetricKey);

// Good: Grouping related selectors
const filters = useDashboardStore(selectAllFilters);

// Good: Custom derived selector for specific needs
const isSpecialPartySelected = useDashboardStore(
  createSelectIsPartyFiltered('BJP')
);
```

### ❌ DON'T

```typescript
// Bad: Getting entire state causes re-renders on ANY change
const state = useDashboardStore();

// Bad: Computing inside component instead of selector
const selectedMetric = useDashboardStore(state =>
  state.metricConfig[state.choroplethMode.selectedMetricKey]
);

// Bad: Creating derived selector inside component (recreated each render)
function Component() {
  const value = useDashboardStore(state => {
    // Don't do this - selector is recreated every render
    return state.stateFilter.stateNames.size;
  });
}
```

## Integration with Existing Map Store

The dashboard store extends and supersedes individual stores:

```typescript
// Old way (still works)
import { useMapStore } from '@/features/maps/map.store';
const selectedFeature = useMapStore(selectSelectedFeature);

// New way (preferred)
import { useDashboardStore, selectSelectedFeature } from '@/store';
const selectedFeature = useDashboardStore(selectSelectedFeature);
```

To fully migrate:
1. Replace `useMapStore` imports with `useDashboardStore`
2. Use dashboard store selectors instead
3. Update map interaction handlers to use `useDashboardStore` actions

## Future Extensions

The store is designed for easy extension:

### Adding New Analytics Metrics

```typescript
// In dashboard.types.ts
export interface AnalyticsMetrics {
  totalVotesAggregated: number;
  averageTurnout: number;
  partyDistribution: Record<string, number>;
}

// In dashboard.store.ts
export interface DashboardState {
  // ... existing state
  analyticsMetrics: AnalyticsMetrics | null;
  selectedChartType: 'bar' | 'pie' | 'line' | null;
}

// In selectors
export const selectAnalyticsMetrics = (state: DashboardStore) => state.analyticsMetrics;
```

### Adding Comparison Mode

```typescript
// Compare two constituencies or states
selectConstituencyComparison: (state: DashboardStore) => ({
  first: state.constituencySelection.selectedConstituencyId,
  second: state.constituencySelection.comparisonConstituencyId
});

// In actions
addComparisonConstituency: (id: string, name: string) => void;
clearComparison: () => void;
```

### Adding Time-based Filters

```typescript
// Filter by election year or time period
timeFilter: {
  year: number;
  electionCycle: string;
}
```

## Debugging

### Check Current State

```typescript
function DebugComponent() {
  const fullState = useDashboardStore(selectDashboardState);
  
  useEffect(() => {
    console.log('Current dashboard state:', fullState);
  }, [fullState]);
  
  return null;
}
```

### View Filters Snapshot

```typescript
function DebugFilters() {
  const snapshot = useDashboardStore(selectFiltersSnapshot);
  
  return (
    <pre>{JSON.stringify(snapshot, null, 2)}</pre>
  );
}
```

## Testing

### Unit Testing with Store

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '@/store';

describe('Dashboard Store', () => {
  it('should select constituency', () => {
    const { result } = renderHook(() => useDashboardStore());
    
    act(() => {
      result.current.selectConstituency('123', 'Mumbai', null);
    });
    
    expect(result.current.constituencySelection.selectedConstituencyId).toBe('123');
  });
});
```

## Migration Checklist

When migrating components to use the dashboard store:

- [ ] Replace individual store imports with `useDashboardStore`
- [ ] Replace specific selectors with dashboard equivalents
- [ ] Update action dispatching to use dashboard store actions
- [ ] Add selector exports if creating custom derived selectors
- [ ] Test map interactions work correctly
- [ ] Test filter updates sync between components
- [ ] Verify no prop drilling remains
- [ ] Profile component re-renders to ensure optimization

## Related Documentation

- **Map Store** (legacy): `frontend/src/features/maps/map.store.ts`
- **Choropleth Store** (legacy): `frontend/src/features/maps/choropleth.store.ts`
- **Types**: `frontend/src/store/dashboard.types.ts`
- **Selectors**: `frontend/src/store/dashboard.selectors.ts`
