# Dashboard Store Integration Guide

## Overview

This guide covers how to integrate the new centralized `useDashboardStore` with existing GIS components while preserving working map logic and interactions.

## Migration Strategy

### Phase 1: Coexistence (Backward Compatible)

Both old stores (`useMapStore`, `useChoroplethModeStore`) and new store (`useDashboardStore`) can run simultaneously:

```typescript
// Components can use either:
import { useMapStore } from '@/features/maps/map.store';
const feature = useMapStore(selectSelectedFeature);

// Or:
import { useDashboardStore } from '@/store';
const feature = useDashboardStore(selectSelectedFeature);
```

### Phase 2: Selective Migration

Gradually migrate components to use the centralized store.

### Phase 3: Deprecation

Once all components are migrated, mark old stores as deprecated.

## Integration Points

### 1. Map Component Integration

**Current: LeafletMap.tsx**

```typescript
// Before
import { useMapStore } from '@/features/maps/map.store';
import { useChoroplethModeStore } from '@/features/maps/choropleth.store';

export function LeafletMap() {
  const selectedFeature = useMapStore(selectSelectedFeature);
  const hoveredFeature = useMapStore(selectHoveredFeature);
  const { selectedMetricKey } = useChoroplethModeStore();
  
  const { setSelectedFeature, setHoveredFeature } = useMapStore();
}
```

**After**

```typescript
// After - Option 1: Full migration
import { useDashboardStore, selectSelectedFeature, selectHoveredFeature } from '@/store';

export function LeafletMap() {
  const selectedFeature = useDashboardStore(selectSelectedFeature);
  const hoveredFeature = useDashboardStore(selectHoveredFeature);
  const metric = useDashboardStore(selectActiveMetricDescriptor);
  
  const { selectConstituency, hoverConstituency } = useDashboardStore();
}
```

### 2. Map Interaction Hooks Integration

**Current: useMapSelection hook**

```typescript
// Before
export function useMapSelection() {
  const { setSelectedFeature, setActiveRegionMetadata } = useMapStore();
  
  return {
    handleSelect: (feature, metadata) => {
      setSelectedFeature(feature, metadata);
    }
  };
}
```

**After**

```typescript
// After
import { useDashboardStore } from '@/store';

export function useMapSelection() {
  const { selectConstituency } = useDashboardStore();
  
  return {
    handleSelect: (feature, metadata) => {
      selectConstituency(
        feature.id?.toString() ?? '',
        feature.properties?.name ?? 'Unknown',
        feature,
        metadata
      );
    }
  };
}
```

### 3. Filter Panel Integration

**Before: Placeholder with no state management**

```typescript
export function FilterPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All controls disabled */}
      </CardContent>
    </Card>
  );
}
```

**After: Connected to store**

```typescript
import { useDashboardStore, selectAllFilters, selectHasActiveFilters } from '@/store';

export function FilterPanel() {
  const filters = useDashboardStore(selectAllFilters);
  const hasActiveFilters = useDashboardStore(selectHasActiveFilters);
  const {
    toggleStateFilter,
    togglePartyFilter,
    setVoteRange,
    setTurnoutRange,
    resetAllFilters,
  } = useDashboardStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          {hasActiveFilters && (
            <button onClick={resetAllFilters} className="text-sm">
              Clear All
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State filter */}
        <StateFilterSection
          selectedStates={filters.stateFilter.stateNames}
          onToggle={toggleStateFilter}
        />
        
        {/* Party filter */}
        <PartyFilterSection
          selectedParties={filters.partyFilter.partyNames}
          onToggle={togglePartyFilter}
        />
        
        {/* Vote range */}
        <VoteRangeSection
          range={filters.voteRangeFilter}
          onChangeRange={setVoteRange}
        />
        
        {/* Turnout filter */}
        <TurnoutFilterSection
          range={filters.turnoutFilter}
          onChangeRange={setTurnoutRange}
        />
      </CardContent>
    </Card>
  );
}
```

### 4. Analytics Panel Integration

**Before: Placeholder with skeletons**

```typescript
export function AnalyticsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder content */}
      </CardContent>
    </Card>
  );
}
```

**After: Connected to filters and metrics**

```typescript
import { useDashboardStore, selectFiltersSnapshot, selectSelectedMetricKey } from '@/store';

export function AnalyticsPanel() {
  const filtersSnapshot = useDashboardStore(selectFiltersSnapshot);
  const metricKey = useDashboardStore(selectSelectedMetricKey);
  const selectedConstituency = useDashboardStore(selectSelectedConstituency);
  const { activeAnalyticsTab, setActiveAnalyticsTab } = useDashboardStore();
  
  // Use filters to compute analytics
  const analytics = useAnalytics({
    filters: filtersSnapshot,
    metric: metricKey,
    constituency: selectedConstituency,
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Render based on analytics data */}
        <StatsSummary stats={analytics.summary} />
        <TabPanel active={activeAnalyticsTab} onTabChange={setActiveAnalyticsTab} />
      </CardContent>
    </Card>
  );
}
```

### 5. Choropleth Selector Integration

**Current: ChoroplethMetricSelector.tsx**

```typescript
// Before
import { useChoroplethModeStore } from '@/features/maps/choropleth.store';

export function ChoroplethMetricSelector() {
  const { selectedMetricKey, setSelectedMetricKey } = useChoroplethModeStore();
  
  return (
    <select value={selectedMetricKey} onChange={(e) => setSelectedMetricKey(e.target.value)}>
      {/* Options */}
    </select>
  );
}
```

**After**

```typescript
// After
import { useDashboardStore, selectSelectedMetricKey } from '@/store';

export function ChoroplethMetricSelector() {
  const selectedMetricKey = useDashboardStore(selectSelectedMetricKey);
  const { setChoroplethMetric } = useDashboardStore();
  
  return (
    <select value={selectedMetricKey} onChange={(e) => setChoroplethMetric(e.target.value)}>
      {/* Options */}
    </select>
  );
}
```

## Preserving GIS Logic

### Keep Working Map Interactions

The dashboard store preserves all existing GIS logic:

```typescript
// All these still work exactly as before:
- Feature hover detection
- Feature selection
- Map zooming and panning
- Choropleth color calculations
- Tooltip rendering
- Legend updates

// They just use the centralized store now
```

### Map Feature Processing Pipeline

```
GeoJSON Feature
    ↓
LeafletMap (renders)
    ↓
Feature interaction detected
    ↓
useMapSelection / useMapHover hook
    ↓
useDashboardStore action (selectConstituency / hoverConstituency)
    ↓
Dashboard store updates
    ↓
Dependent components re-render
    ↓
Choropleth recalculates colors
    ↓
Map visual updates
```

### Ensuring No Breaking Changes

1. **Map still renders exactly the same**
   - GeoJSON loading unchanged
   - Styling logic unchanged
   - Interactions unchanged

2. **Feature properties preserved**
   - All GeoJSON properties available in state
   - Metadata structure consistent

3. **Color calculations unchanged**
   - Choropleth metrics work identically
   - Color scales preserved
   - Category mappings preserved

## Implementation Checklist

### Phase 1: Prepare Store
- [x] Create `dashboard.store.ts`
- [x] Create `dashboard.types.ts`
- [x] Create `dashboard.selectors.ts`
- [x] Create `index.ts` exports
- [x] Test store independently

### Phase 2: Migrate Map Components
- [ ] Update `LeafletMap.tsx` to use `useDashboardStore`
- [ ] Update `IndiaGeoJSONLayer.tsx` to read from new store
- [ ] Update `useMapSelection`, `useMapHover` hooks
- [ ] Update `useMapZoom` hook
- [ ] Verify map rendering unchanged
- [ ] Verify interactions work
- [ ] Test hover tooltips
- [ ] Test selection highlighting

### Phase 3: Migrate Filter Components
- [ ] Create proper `FilterPanel` implementation
- [ ] Connect state filters to store
- [ ] Connect party filters to store
- [ ] Connect vote range filter to store
- [ ] Connect turnout filter to store
- [ ] Add reset/apply buttons
- [ ] Test filter UI

### Phase 4: Migrate Analytics Components
- [ ] Create proper `AnalyticsPanel` implementation
- [ ] Connect to store selectors
- [ ] Build analytics query from filters
- [ ] Add charts (future phase)

### Phase 5: Integration Testing
- [ ] End-to-end filter to map flow
- [ ] Verify no prop drilling
- [ ] Check performance (no unnecessary re-renders)
- [ ] Test all filter combinations
- [ ] Verify mobile responsive

## Common Integration Patterns

### Pattern 1: Action on Selection

```typescript
function MapComponent() {
  const { selectConstituency, setActiveAnalyticsTab } = useDashboardStore();
  
  const handleSelectFeature = (feature) => {
    selectConstituency(feature.id, feature.properties.name, feature);
    // Automatically show analytics
    setActiveAnalyticsTab('overview');
  };
}
```

### Pattern 2: Filter-Aware Rendering

```typescript
function MapLegend() {
  const hasActiveFilters = useDashboardStore(selectHasActiveFilters);
  const filterSummary = useDashboardStore(selectActiveFiltersSummary);
  
  return (
    <div>
      {hasActiveFilters && (
        <p className="text-sm text-amber-600">
          Showing {filterSummary.totalActiveFilters} active filters
        </p>
      )}
      {/* Legend content */}
    </div>
  );
}
```

### Pattern 3: Metric-Dependent UI

```typescript
function FeatureInfoPanel() {
  const selectedFeature = useDashboardStore(selectSelectedFeature);
  const metric = useDashboardStore(selectActiveMetricDescriptor);
  
  if (!selectedFeature || !metric) return null;
  
  const value = metric.extractValue(selectedFeature);
  const formatted = metric.formatValue(value);
  
  return (
    <div>
      <h3>{selectedFeature.properties?.name}</h3>
      <p>{metric.label}: {formatted}</p>
    </div>
  );
}
```

## Testing Guidelines

### Unit Tests

```typescript
describe('Dashboard Store Integration', () => {
  it('should update map when constituency selected', () => {
    const { result } = renderHook(() => useDashboardStore());
    
    act(() => {
      result.current.selectConstituency('123', 'Mumbai', mockFeature);
    });
    
    expect(result.current.selectedFeature).toBe(mockFeature);
    expect(result.current.mapInteraction.mode).toBe('select');
  });
});
```

### Integration Tests

```typescript
describe('Filter to Map Integration', () => {
  it('should update map colors when metric changes', async () => {
    render(<MapSection />);
    
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'winningParty' } });
    
    await waitFor(() => {
      expect(screen.getByClass('gis-layer-updated')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Store not updating?
- Check selector is correct
- Verify action is dispatched
- Use Redux DevTools: `npx zustand-devtools`

### Map not re-rendering?
- Ensure selector is specific, not entire state
- Check feature comparison (use IDs not objects)
- Verify effect dependencies

### Performance issues?
- Profile with React DevTools
- Check for `selectDashboardState` usage
- Verify selectors aren't recreated

## Related Files

- Store files: `frontend/src/store/`
- Map components: `frontend/src/features/maps/components/`
- Filter components: `frontend/src/features/filters/components/`
- Analytics components: `frontend/src/features/analytics/components/`
- Dashboard page: `frontend/src/app/dashboard/page.tsx`
