# Centralized GIS Dashboard Store Architecture

## Summary

A comprehensive Zustand-based state management solution for the GIS dashboard that provides:

✅ **Single source of truth** for all dashboard state  
✅ **Elimination of prop drilling** through centralized store  
✅ **Scalable architecture** supporting future features  
✅ **Type-safe** with full TypeScript support  
✅ **Performance optimized** with Zustand selectors  
✅ **Backward compatible** with existing GIS logic

## Files Created

### Core Store Files

| File | Purpose |
|------|---------|
| `dashboard.types.ts` | Type definitions for all dashboard state |
| `dashboard.store.ts` | Main Zustand store with actions |
| `dashboard.selectors.ts` | Reusable selector functions |
| `index.ts` | Central export point |

### Documentation Files

| File | Purpose |
|------|---------|
| `STORE_USAGE.md` | Comprehensive usage patterns and examples |
| `INTEGRATION_GUIDE.md` | Step-by-step integration with existing components |
| `README.md` | This file - architecture overview |

## Quick Start

### Install Store in Component

```typescript
import { useDashboardStore, selectSelectedConstituency } from '@/store';

function MyComponent() {
  const constituency = useDashboardStore(selectSelectedConstituency);
  return <div>{constituency.name}</div>;
}
```

### Dispatch Actions

```typescript
const { selectConstituency, setVoteRange } = useDashboardStore();

selectConstituency('123', 'Mumbai', feature);
setVoteRange(100000, 5000000);
```

## Architecture

### State Organization

```
DashboardState
├── Constituency Selection
│   ├── selectedConstituencyId
│   ├── selectedConstituencyName
│   ├── hoveredConstituencyId
│   └── hoveredConstituencyName
├── Map Interactions
│   ├── hoveredFeature
│   ├── selectedFeature
│   ├── activeRegionMetadata
│   └── mapInteraction (mode, dragging, etc.)
├── Visualization
│   ├── choroplethMode
│   │   ├── selectedMetricKey
│   │   └── isConfigLoaded
│   └── metricConfig
├── Filters
│   ├── stateFilter (stateCodes, stateNames, enabled)
│   ├── partyFilter (partyNames, enabled)
│   ├── voteRangeFilter (min, max, enabled)
│   └── turnoutFilter (min, max, enabled)
└── UI State
    ├── isFilterPanelOpen
    ├── isAnalyticsPanelOpen
    └── activeAnalyticsTab
```

### Data Flow

```
User Interaction (click, hover, select filter)
    ↓
Component dispatches action
    ↓
Store updates state
    ↓
Selector notifies subscribers
    ↓
Dependent components re-render
    ↓
Map/Analytics update visualizations
```

## Key Features

### 1. Constituency Selection

Track both selected and hovered constituencies for map interactions:

```typescript
// Read
const { id, name } = useDashboardStore(selectSelectedConstituency);

// Write
selectConstituency('123', 'Mumbai', feature, { level: 'constituency' });
hoverConstituency('456', 'Delhi', feature);
```

### 2. Comprehensive Filtering

Support multiple filter types simultaneously:

```typescript
// State filters
toggleStateFilter('MH', 'Maharashtra');

// Party filters  
togglePartyFilter('Bharatiya Janata Party');

// Numeric ranges
setVoteRange(100000, 5000000);
setTurnoutRange(50, 100);

// Check active filters
const summary = useDashboardStore(selectActiveFiltersSummary);
```

### 3. Choropleth Visualization Control

Manage metric selection and configuration:

```typescript
// Change metric
setChoroplethMetric('marginPercentage');

// Get active metric
const metric = useDashboardStore(selectActiveMetricDescriptor);
const value = metric.extractValue(feature);
const color = metric.getColor(value); // For visualization
```

### 4. Map Interaction State

Synchronize complex map interactions:

```typescript
// Update interaction mode
updateMapInteraction({ mode: 'zoom', isDragging: true });

// Get interaction state
const mode = useDashboardStore(selectMapInteractionMode);
const isZoomed = useDashboardStore(selectMapViewLevel) === 'constituency';

// Reset on map pan
resetMapInteraction();
```

### 5. UI State Management

Control panel visibility and tabs:

```typescript
// Toggle panels
toggleFilterPanel();
toggleAnalyticsPanel();

// Manage tabs
setActiveAnalyticsTab('overview');
const activeTab = useDashboardStore(selectActiveAnalyticsTab);
```

## Selector Categories

### Efficiency

Zustand selectors only trigger re-renders when that specific value changes:

```typescript
// ✅ Efficient: Only re-renders if constituency changes
const constituency = useDashboardStore(selectSelectedConstituency);

// ❌ Inefficient: Re-renders on ANY state change
const state = useDashboardStore();
const constituency = state.constituencySelection.selectedConstituency;
```

### Available Selectors

**Constituency** (9 selectors)
- `selectSelectedConstituency`
- `selectHoveredConstituency`
- `selectStateFilterCount`

**Map** (9 selectors)
- `selectHoveredFeature`
- `selectSelectedFeature`
- `selectMapInteractionMode`
- `selectMapViewLevel`

**Visualization** (5 selectors)
- `selectSelectedMetricKey`
- `selectActiveMetricDescriptor`
- `selectMetricConfig`

**Filters** (15+ selectors)
- `selectStateFilterNames`
- `selectPartyFilterCount`
- `selectVoteRangeMin/Max`
- `selectHasActiveFilters`
- `selectActiveFiltersSummary`
- `selectFiltersSnapshot`

**Combined** (5 selectors)
- `selectUIState`
- `selectAllFilters`
- `selectMapState`
- `selectVisualizationState`

## Actions

### Constituency Actions
- `selectConstituency(id, name, feature, metadata)`
- `deselectConstituency()`
- `hoverConstituency(id, name, feature)`

### Choropleth Actions
- `setChoroplethMetric(metricKey)`
- `setChoroplethMode(mode)`
- `setMetricConfig(config)`

### Filter Actions
- `toggleStateFilter(code, name)`
- `togglePartyFilter(name)`
- `setVoteRange(min, max)`
- `setTurnoutRange(min, max)`
- `resetAllFilters()`
- `applyFilters()`

### UI Actions
- `toggleFilterPanel()`
- `toggleAnalyticsPanel()`
- `setActiveAnalyticsTab(tabId)`

### Reset
- `resetDashboard()` - Full reset to initial state
- `resetMapInteraction()` - Reset only map interactions

## Integration with Existing Components

### Map Components
Map interactions automatically sync with filter state:
```typescript
// LeafletMap.tsx
const { hoverConstituency, selectConstituency } = useDashboardStore();

// When user clicks feature → selectConstituency
// When user hovers feature → hoverConstituency
```

### Filter Components
Connect UI controls to store actions:
```typescript
// FilterPanel.tsx (new implementation)
const { toggleStateFilter, setVoteRange } = useDashboardStore();
const filters = useDashboardStore(selectAllFilters);

// Show selected filters
<SelectedFilters filters={filters} />

// Apply changes
<FilterControls onStateToggle={toggleStateFilter} />
```

### Analytics Components
Build queries from filter snapshot:
```typescript
// AnalyticsPanel.tsx (new implementation)
const filtersSnapshot = useDashboardStore(selectFiltersSnapshot);
const metric = useDashboardStore(selectSelectedMetricKey);

// Use for backend query
const analytics = await fetchAnalytics({ filters: filtersSnapshot, metric });
```

## Scalability

The store is designed for future extensions:

### Ready for Future Features
- ✅ Analytics charts and KPIs
- ✅ Comparison mode (compare constituencies)
- ✅ Time-based filters (historical data)
- ✅ Custom metric definitions
- ✅ Saved filter presets
- ✅ Export functionality
- ✅ Backend sync/persistence

### Easy to Extend
```typescript
// Add new filter type
export interface CustomFilter extends RangeFilter {
  category: string;
}

// Add to state
interface DashboardState {
  customFilter: CustomFilter;
}

// Add actions
customFilterActions: {
  setCustomFilter: (filter: Partial<CustomFilter>) => void;
}

// Add selectors
export const selectCustomFilter = (state) => state.customFilter;
```

## Best Practices

### ✅ DO

1. **Use specific selectors**
   ```typescript
   const name = useDashboardStore(selectSelectedConstituencyName);
   ```

2. **Group related selectors**
   ```typescript
   const filters = useDashboardStore(selectAllFilters);
   ```

3. **Create derived selectors for reuse**
   ```typescript
   export const selectIsPartyFiltered = createSelectIsPartyFiltered(partyName);
   ```

4. **Use snapshot for debugging**
   ```typescript
   const snapshot = useDashboardStore(selectFiltersSnapshot);
   console.log('Current filters:', snapshot);
   ```

### ❌ DON'T

1. **Avoid full state selectors**
   ```typescript
   // Bad
   const state = useDashboardStore();
   ```

2. **Don't recreate selectors in components**
   ```typescript
   // Bad - creates new function every render
   const value = useDashboardStore(state => 
     state.filters.state.codes.size
   );
   ```

3. **Avoid complex logic in selectors**
   ```typescript
   // Use separate hooks or memo instead
   ```

## Performance Characteristics

| Operation | Performance |
|-----------|-------------|
| Selector read | O(1) - Very fast |
| Single action | O(1) - Very fast |
| Batch filters | O(n) - Linear with filter count |
| State snapshot | O(n) - Linear with state size |
| Component re-render | Only if selector value changed |

## Testing

### Test Store in Isolation
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '@/store';

describe('Dashboard Store', () => {
  it('should select constituency', () => {
    const { result } = renderHook(() => useDashboardStore());
    
    act(() => {
      result.current.selectConstituency('1', 'Test', null);
    });
    
    expect(result.current.constituencySelection.selectedConstituencyId).toBe('1');
  });
});
```

### Test Component Integration
```typescript
describe('MapComponent with Store', () => {
  it('updates map when filter applied', async () => {
    render(<MapComponent />);
    
    const filterBtn = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterBtn);
    
    await waitFor(() => {
      expect(screen.getByClass('map-updated')).toBeInTheDocument();
    });
  });
});
```

## Documentation

| Document | Content |
|----------|---------|
| `STORE_USAGE.md` | Detailed usage patterns, examples, debugging |
| `INTEGRATION_GUIDE.md` | Step-by-step component integration |
| `README.md` | This file - architecture overview |
| Inline JSDoc | Type definitions and function documentation |

## Migration Timeline

**Now:**
- ✅ Store ready for use
- ✅ All types defined
- ✅ All selectors available

**Next (Phase 1 - Map):**
- [ ] Migrate LeafletMap to use store
- [ ] Update map hooks

**Phase 2 - Filters:**
- [ ] Implement functional FilterPanel
- [ ] Connect all filter controls

**Phase 3 - Analytics:**
- [ ] Implement functional AnalyticsPanel
- [ ] Connect to filter state

## Troubleshooting

### Store not updating?
- Check action is being called
- Verify selector is correct
- Use browser DevTools

### Component not re-rendering?
- Ensure using a selector, not full state
- Check if selector value actually changed
- Profile with React DevTools

### Performance issues?
- Profile component re-renders
- Check for unnecessary selector combinations
- Verify no external side effects

## Support

For questions or issues:
1. Check `STORE_USAGE.md` for patterns
2. Check `INTEGRATION_GUIDE.md` for integration help
3. Review inline JSDoc in store files
4. Check existing tests for examples

## Related Files

```
frontend/src/
├── store/                        # ← New centralized store
│   ├── dashboard.types.ts
│   ├── dashboard.store.ts
│   ├── dashboard.selectors.ts
│   ├── index.ts
│   ├── README.md (this file)
│   ├── STORE_USAGE.md
│   └── INTEGRATION_GUIDE.md
│
├── features/
│   ├── maps/
│   │   ├── map.store.ts         # ← Legacy (being replaced)
│   │   ├── choropleth.store.ts  # ← Legacy (being replaced)
│   │   └── components/
│   │       ├── LeafletMap.tsx    # ← Update to use new store
│   │       └── ...
│   ├── filters/
│   │   └── components/
│   │       └── filter-panel.tsx  # ← Update to use new store
│   └── analytics/
│       └── components/
│           └── analytics-panel.tsx # ← Update to use new store
│
└── app/dashboard/
    └── page.tsx                  # ← Dashboard layout
```

---

**Version:** 1.0  
**Created:** 2024  
**Status:** Ready for integration  
**Maintenance:** Active development
