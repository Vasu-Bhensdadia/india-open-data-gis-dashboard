# Constituency Intelligence Panel Implementation

## Overview

This document describes the implementation of the professional constituency intelligence panel for the India Open Data GIS election analytics dashboard. The panel displays detailed constituency profiles with election metrics when a constituency is selected from the map.

## Architecture

### Components

#### 1. **ConstituencyProfile Component** (`constituency-profile.tsx`)
The main component that displays a complete constituency intelligence profile.

**Features:**
- Displays constituency identification (name, state, number, type)
- Shows winner and runner-up information in dedicated cards
- Displays key metrics (margin, margin %, total votes)
- Responsive layout adapts from mobile to desktop
- Handles loading and error states gracefully
- Empty state when no constituency is selected

**Props:**
```typescript
interface ConstituencyProfileProps {
  feature: GeoJSONFeature<Record<string, unknown>> | null;
  metrics: ElectionMetrics | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}
```

**Integration:**
The component is integrated into the `AnalyticsPanel` and automatically updates when a constituency is selected from the map via the dashboard store.

#### 2. **ElectionSummaryCard Component** (`election-summary-card.tsx`)
A reusable card component for displaying election result information.

**Features:**
- Shows candidate name, party, and vote count
- Supports party color coding
- Semantic color toning (blue, amber, rose, emerald, neutral)
- Optional metadata display
- Responsive sizing
- Hover effects for visual feedback

**Props:**
```typescript
interface ElectionSummaryCardProps {
  title: string;
  candidateName: string;
  partyName: string;
  votes: string;
  accentColor?: string;
  tone?: "blue" | "amber" | "rose" | "emerald" | "neutral";
  metadata?: Array<{ label: string; value: string }>;
  loading?: boolean;
  className?: string;
}
```

**Usage:**
- Used twice in `ConstituencyProfile` for winner and runner-up
- Can be reused for other election result displays

### Utilities

#### **constituency-profile.ts** (`utils/constituency-profile.ts`)
Core analytics helpers for processing election metrics.

**Key Functions:**

1. **`buildConstituencyProfile(metrics, featureProperties)`**
   - Builds raw constituency profile from election metrics and GeoJSON properties
   - Extracts constituency number, candidate names, and calculates turnout

2. **`formatConstituencyProfile(profile)`**
   - Applies number formatting for display
   - Creates display-ready strings with proper localization (en-IN)
   - Returns `FormattedConstituencyProfile` interface

3. **`getPartyColor(partyName)`**
   - Maps party names to official party colors
   - Returns hex color codes for 15+ major Indian parties
   - Default gray for unknown parties

4. **`getPartyTone(partyName)`**
   - Maps parties to semantic color tones for UI
   - Supports: blue, amber, rose, emerald, neutral
   - Used for card styling and visual emphasis

**Data Types:**

```typescript
interface ConstituencyProfileData {
  constituencyName: string;
  stateName: string;
  constituencyNumber: string | null;
  constituencyType: string;
  winnerCandidate: string | null;
  winnerParty: string;
  runnerUpCandidate: string | null;
  runnerUpParty: string | null;
  winnerVotes: number;
  runnerUpVotes: number;
  winningMargin: number;
  winningMarginPercentage: number;
  totalVotes: number;
  turnoutPercentage: number | null;
}

interface FormattedConstituencyProfile {
  constituencyName: string;
  stateName: string;
  constituencyNumber: string;
  constituencyType: string;
  winner: { candidate: string; party: string; votes: string };
  runnerUp: { candidate: string; party: string; votes: string };
  metrics: {
    margin: string;
    marginPercentage: string;
    totalVotes: string;
    turnout: string;
  };
}
```

## Data Flow

```
Map Click
  ↓
Dashboard Store (selectConstituency)
  ↓
AnalyticsPanel (selectedFeature via useDashboard)
  ↓
ConstituencyProfile Component
  ↓
ElectionSummaryCard × 2 (Winner & Runner-up)
```

### Integration with Existing Systems

#### Dashboard Store (`@/store/dashboard.store`)
- **Action Used:** `selectConstituency()`
- **State Accessed:** `selectedFeature`
- Automatically called when user clicks a constituency on the map
- Eliminates prop drilling - panel updates reactively

#### Election Metrics Service (`@/services/election-metrics.service`)
- **Function Used:** `getElectionMetrics(stateName, constituencyName, metricsIndex)`
- Provides election data from `/data/election_metrics.json`
- Includes: votes, margins, party information, turnout percentages
- Cached for performance

#### Analytics Panel (`analytics-panel.tsx`)
- **Integration Point:** Component composition and state management
- Loads constituency profile when a constituency is selected
- Manages loading and error states
- Responsive to filter changes

## Responsive Design

### Layout Breakpoints

**Mobile (default):**
- Single column layout
- Winner and runner-up cards stack vertically
- Full width metrics summary
- Optimized touch targets

**Tablet (sm: 640px+):**
- Two-column grid for winner/runner-up
- Better spacing and readability

**Desktop (sm: 640px+):**
- Two-column grid maintained
- Sidebar integration in 3-column dashboard layout

### CSS Framework
- **TailwindCSS** with custom component classes
- **shadcn/ui** Card components for consistency
- Responsive utilities: `sm:`, `md:`, `xl:` breakpoints

## Styling & Design Language

### Color System
**Party Colors:**
- BJP: #ff9933 (Orange)
- INC: #19AAED (Blue)
- DMK: #dd1100 (Red)
- YSRCP: #1569C7 (Dark Blue)
- TDP: #ffe200 (Yellow)
- And 10+ more major parties

**Semantic Tones:**
- **Blue**: Congress, YSRCP (opposition/center-left)
- **Amber**: BJP, TDP, Shiv Sena (center-right/regional)
- **Rose**: DMK, CPI(M), Samajwadi Party (left/regional)
- **Emerald**: AITC (regional)
- **Neutral**: Unknown/unclassified parties

### Component Styling
- **Headers:** 16px, semibold, slate-950
- **Labels:** 11px uppercase, tracking-[0.18em], slate-500
- **Metadata:** 10px uppercase, tracking-[0.16em]
- **Values:** 18-24px bold, slate-900/950
- **Card Borders:** 1px solid, zinc/slate-200
- **Card Background:** White or semi-transparent tinted
- **Hover Effects:** -translate-y-0.5, shadow-sm

## Key Features

### ✓ Dynamic Updates
- Constituency profile updates instantly when selection changes
- Reactive to dashboard store changes
- No page refresh needed

### ✓ Error Handling
- Graceful handling of missing metrics
- Clear error messages for unavailable data
- Loading states during data fetching

### ✓ Performance
- Memoized calculations to prevent unnecessary re-renders
- Cached election metrics via service
- Efficient property extraction from GeoJSON

### ✓ Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Color indicators with aria-labels
- High contrast text

### ✓ Responsive
- Mobile-first design
- Tablet and desktop optimizations
- Touch-friendly interactive elements

## Usage Examples

### Basic Integration (Already Done)
```typescript
// In AnalyticsPanel
<ConstituencyProfile
  feature={selectedFeature}
  metrics={selectedMetricsData}
  loading={isBusy}
  error={selectedMetricsData === null && selectedFeature ? "Metrics not available" : null}
/>
```

### Using ElectionSummaryCard Independently
```typescript
import { ElectionSummaryCard } from "@/features/analytics/components/election-summary-card";

export function CustomCard() {
  return (
    <ElectionSummaryCard
      title="Winner"
      candidateName="John Doe"
      partyName="Bharatiya Janata Party"
      votes="745,328"
      accentColor="#ff9933"
      tone="amber"
      metadata={[
        { label: "Votes %", value: "52.4%" }
      ]}
    />
  );
}
```

### Using Helpers
```typescript
import {
  buildConstituencyProfile,
  formatConstituencyProfile,
  getPartyColor,
  getPartyTone,
} from "@/features/analytics/utils/constituency-profile";

// Build and format profile
const profile = buildConstituencyProfile(metrics, featureProperties);
const formatted = formatConstituencyProfile(profile);

// Get party styling
const color = getPartyColor("Bharatiya Janata Party"); // "#ff9933"
const tone = getPartyTone("Bharatiya Janata Party"); // "amber"
```

## File Structure

```
frontend/src/features/analytics/
├── components/
│   ├── analytics-panel.tsx              (updated)
│   ├── constituency-profile.tsx         (new)
│   ├── election-summary-card.tsx        (new)
│   └── ...
├── utils/
│   ├── constituency-profile.ts          (new)
│   └── ...
└── ...
```

## Future Enhancements

1. **Candidate History:** Track historical performance across elections
2. **Comparison View:** Compare multiple constituencies side-by-side
3. **Trend Analysis:** Show vote share trends over time
4. **Export Functionality:** Generate reports with constituency data
5. **Timeline View:** Display election results chronologically
6. **Detailed Charts:** Visualize vote distribution and trends
7. **Historical Candidates:** Link to candidate pages with full history

## Testing Checklist

- [ ] Click on a constituency to select it
- [ ] Verify profile displays with correct data
- [ ] Check responsive layout on mobile/tablet/desktop
- [ ] Verify party colors display correctly
- [ ] Test error states (missing data)
- [ ] Verify profile updates when switching constituencies
- [ ] Check number formatting (en-IN locale)
- [ ] Verify accessibility of all elements

## Dependencies

- **react:** UI components
- **zustand:** State management (dashboard store)
- **tailwindcss:** Styling
- **shadcn/ui:** Card component library
- **lucide-react:** Icons
- **@/services/election-metrics.service:** Election data
- **@/services/geojson.service:** GeoJSON data
- **@/store/dashboard.store:** Dashboard state management

## Notes

- The implementation avoids recalculating values already available in the election metrics
- Number formatting uses en-IN locale for Indian number system (lakhs, crores)
- Party colors are cached via mapping objects for performance
- The component is fully typed with TypeScript for IDE support and type safety
- All components follow the existing dashboard design language and patterns
