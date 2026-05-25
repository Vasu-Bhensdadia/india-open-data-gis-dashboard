# Dashboard Store - Quick Reference

## Import the Store

```typescript
import { useDashboardStore } from '@/store';
import { useDashboardStore, selectSelectedConstituency } from '@/store';
```

## Read State with Selectors

```typescript
// Single value
const name = useDashboardStore(selectSelectedConstituencyName);

// Related values
const { id, name } = useDashboardStore(selectSelectedConstituency);

// Multiple categories
const filters = useDashboardStore(selectAllFilters);
const uiState = useDashboardStore(selectUIState);

// Derived state
const hasFilters = useDashboardStore(selectHasActiveFilters);
const summary = useDashboardStore(selectActiveFiltersSummary);
```

## Dispatch Actions

```typescript
// Get all actions
const store = useDashboardStore();

// Constituency actions
store.selectConstituency(id, name, feature, metadata);
store.deselectConstituency();
store.hoverConstituency(id, name, feature, metadata);

// Metric actions
store.setChoroplethMetric('winningParty');
store.setMetricConfig(config);

// Filter actions
store.toggleStateFilter('MH', 'Maharashtra');
store.togglePartyFilter('BJP');
store.setVoteRange(100000, 5000000);
store.setTurnoutRange(50, 100);
store.resetAllFilters();
store.applyFilters();

// UI actions
store.toggleFilterPanel();
store.toggleAnalyticsPanel();
store.setActiveAnalyticsTab('overview');

// Reset
store.resetMapInteraction();
store.resetDashboard();
```

## Common Patterns

### Reading Single Values

```typescript
function Component() {
  const constituent = useDashboardStore(selectSelectedConstituencyName);
  return <div>{constituent}</div>;
}
```

### Reading Multiple Values

```typescript
function Component() {
  const metricKey = useDashboardStore(selectSelectedMetricKey);
  const metric = useDashboardStore(selectActiveMetricDescriptor);
  const feature = useDashboardStore(selectSelectedFeature);
  
  return <div>{metric?.label}</div>;
}
```

### Dispatching Actions

```typescript
function Component() {
  const { selectConstituency, setChoroplethMetric } = useDashboardStore();
  
  const handleClick = (feature) => {
    selectConstituency(feature.id, feature.properties.name, feature);
    setChoroplethMetric('marginPercentage');
  };
  
  return <button onClick={handleClick}>Select</button>;
}
```

### Batch Operations

```typescript
function Component() {
  const { toggleStateFilter, togglePartyFilter, applyFilters } = useDashboardStore();
  
  const handleApplyFilters = () => {
    toggleStateFilter('MH', 'Maharashtra');
    togglePartyFilter('BJP');
    applyFilters();
  };
  
  return <button onClick={handleApplyFilters}>Apply</button>;
}
```

## State Structure Quick View

```
useDashboardStore()
├── constituencySelection
│   ├── selectedConstituencyId
│   ├── selectedConstituencyName
│   ├── hoveredConstituencyId
│   └── hoveredConstituencyName
├── hoveredFeature
├── selectedFeature
├── activeRegionMetadata
├── mapInteraction
│   ├── mode: 'idle' | 'hover' | 'select' | 'zoom' | 'drilldown'
│   ├── isDragging: boolean
│   ├── isResettingView: boolean
│   ├── lastInteractedFeatureId: string | null
│   └── viewLevel: 'country' | 'state' | 'district' | 'constituency'
├── choroplethMode
│   ├── selectedMetricKey
│   └── isConfigLoaded: boolean
├── metricConfig
├── stateFilter
│   ├── stateCodes: Set<string>
│   ├── stateNames: Set<string>
│   └── enabled: boolean
├── partyFilter
│   ├── partyNames: Set<string>
│   └── enabled: boolean
├── voteRangeFilter
│   ├── min: number
│   ├── max: number
│   └── enabled: boolean
├── turnoutFilter
│   ├── min: number
│   ├── max: number
│   └── enabled: boolean
├── isFilterPanelOpen: boolean
├── isAnalyticsPanelOpen: boolean
└── activeAnalyticsTab: string | null
```

## Selector Groups

### Constituency Selectors (9)
```typescript
selectSelectedConstituencyId
selectSelectedConstituencyName
selectSelectedConstituency
selectHoveredConstituencyId
selectHoveredConstituencyName
selectHoveredConstituency
selectConstituencySelection
```

### Map Feature Selectors (3)
```typescript
selectHoveredFeature
selectSelectedFeature
selectActiveRegionMetadata
```

### Map Interaction Selectors (9)
```typescript
selectMapInteraction
selectMapInteractionMode
selectIsMapDragging
selectIsResettingMapView
selectMapViewLevel
selectLastInteractedFeatureId
```

### Choropleth Selectors (5)
```typescript
selectChoroplethMode
selectSelectedMetricKey
selectIsChoroplethConfigLoaded
selectMetricConfig
selectActiveMetricDescriptor
```

### State Filter Selectors (5)
```typescript
selectStateFilter
selectStateFilterCodes
selectStateFilterNames
selectIsStateFilterEnabled
selectStateFilterCount
```

### Party Filter Selectors (4)
```typescript
selectPartyFilter
selectPartyFilterNames
selectIsPartyFilterEnabled
selectPartyFilterCount
createSelectIsPartyFiltered(partyName)
```

### Vote Range Selectors (3)
```typescript
selectVoteRangeFilter
selectVoteRangeMin
selectVoteRangeMax
selectIsVoteRangeFilterEnabled
```

### Turnout Filter Selectors (3)
```typescript
selectTurnoutFilter
selectTurnoutMin
selectTurnoutMax
selectIsTurnoutFilterEnabled
```

### Derived Filter Selectors (3)
```typescript
selectHasActiveFilters
selectActiveFiltersSummary
selectFiltersSnapshot
```

### UI State Selectors (3)
```typescript
selectIsFilterPanelOpen
selectIsAnalyticsPanelOpen
selectActiveAnalyticsTab
```

### Combined State Selectors (5)
```typescript
selectDashboardState
selectUIState
selectAllFilters
selectMapState
selectVisualizationState
```

## Action Groups

### Constituency Actions (3)
```typescript
selectConstituency(id, name, feature, metadata?)
deselectConstituency()
hoverConstituency(id, name, feature?, metadata?)
```

### Map Interaction Actions (3)
```typescript
updateMapInteraction(partial)
resetMapInteraction()
setActiveRegionMetadata(metadata)
```

### Choropleth Actions (3)
```typescript
setChoroplethMetric(metricKey)
setChoroplethMode(mode)
setMetricConfig(config)
```

### State Filter Actions (4)
```typescript
toggleStateFilter(code, name)
clearStateFilter()
setStateFilterEnabled(enabled)
setStateFilter(filter)
```

### Party Filter Actions (4)
```typescript
togglePartyFilter(name)
clearPartyFilter()
setPartyFilterEnabled(enabled)
setPartyFilter(filter)
```

### Vote Range Actions (3)
```typescript
setVoteRange(min, max)
setVoteRangeFilterEnabled(enabled)
setVoteRangeFilter(filter)
```

### Turnout Actions (3)
```typescript
setTurnoutRange(min, max)
setTurnoutFilterEnabled(enabled)
setTurnoutFilter(filter)
```

### Batch Filter Actions (2)
```typescript
resetAllFilters()
applyFilters()
```

### UI Actions (3)
```typescript
toggleFilterPanel()
toggleAnalyticsPanel()
setActiveAnalyticsTab(tabId)
```

### Reset Actions (2)
```typescript
resetMapInteraction()
resetDashboard()
```

## Performance Tips

### ✅ Good - Specific Selectors
```typescript
const name = useDashboardStore(selectSelectedConstituencyName);
const metric = useDashboardStore(selectSelectedMetricKey);
```

### ❌ Bad - Entire State
```typescript
const state = useDashboardStore(); // Re-renders on every change!
```

### ✅ Good - Combined Selectors
```typescript
const filters = useDashboardStore(selectAllFilters);
```

### ❌ Bad - Multiple Unrelated Selectors
```typescript
const constituency = useDashboardStore(selectSelectedConstituency);
const filters = useDashboardStore(selectAllFilters);
// Better: Use selectMapState or combine into single selector
```

## Testing Patterns

### Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '@/store';

const { result } = renderHook(() => useDashboardStore());
act(() => result.current.selectConstituency('1', 'Test', null));
expect(result.current.constituencySelection.selectedConstituencyId).toBe('1');
```

### Component Integration
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

render(<MyComponent />);
const element = screen.getByText(/expected text/);
expect(element).toBeInTheDocument();
```

## Migration Checklist

- [ ] Import `useDashboardStore` instead of `useMapStore`
- [ ] Replace selector imports with dashboard selectors
- [ ] Update component to use new selectors
- [ ] Update action dispatches to use new store
- [ ] Test map interactions
- [ ] Test filter updates
- [ ] Profile for performance
- [ ] Remove old store imports

## Debugging

### Console Log State
```typescript
function DebugComponent() {
  const state = useDashboardStore(selectDashboardState);
  useEffect(() => {
    console.log('Dashboard state:', state);
  }, [state]);
  return null;
}
```

### View Filters
```typescript
const filters = useDashboardStore(selectFiltersSnapshot);
console.log('Active filters:', filters);
```

### Monitor Selector
```typescript
const constituency = useDashboardStore(selectSelectedConstituency);
useEffect(() => {
  console.log('Selected changed:', constituency);
}, [constituency]);
```

## Common Mistakes

### Mistake 1: Recreating Selector
```typescript
// ❌ Bad - new function every render
const value = useDashboardStore(state => state.stateFilter.stateCodes.size);

// ✅ Good - use existing selector
const count = useDashboardStore(selectStateFilterCount);
```

### Mistake 2: Entire State
```typescript
// ❌ Bad - re-renders on any state change
const store = useDashboardStore();

// ✅ Good - only re-renders if this value changes
const name = useDashboardStore(selectSelectedConstituencyName);
```

### Mistake 3: Forgetting Selector
```typescript
// ❌ Bad - reads entire state
const { selectedConstituency } = useDashboardStore();

// ✅ Good - use selector
const name = useDashboardStore(selectSelectedConstituencyName);
```

## Further Reading

- `README.md` - Architecture overview
- `STORE_USAGE.md` - Comprehensive usage guide
- `INTEGRATION_GUIDE.md` - Component integration steps
- Source code - JSDoc comments in `dashboard.store.ts`
