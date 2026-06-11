# Constituency Intelligence Panel - Quick Reference

## Installation & Usage

### Option 1: Automatic (Already Integrated)
The constituency profile is already integrated into the analytics panel. Simply:
1. Click on a constituency on the map
2. The profile will automatically appear in the right analytics panel

### Option 2: Import Components Individually

```typescript
import {
  ConstituencyProfile,
  ElectionSummaryCard,
  buildConstituencyProfile,
  formatConstituencyProfile,
  getPartyColor,
  getPartyTone,
} from "@/features/analytics";

import type {
  ConstituencyProfileData,
  FormattedConstituencyProfile,
} from "@/features/analytics";
```

## Component Reference

### ConstituencyProfile

**Main constituency intelligence panel component.**

```typescript
import { ConstituencyProfile } from "@/features/analytics";

export function MyComponent() {
  const selectedFeature = useMyStore((s) => s.selectedFeature);
  const metrics = useMyMetrics();

  return (
    <ConstituencyProfile
      feature={selectedFeature}
      metrics={metrics}
      loading={isLoading}
      error={errorMessage}
    />
  );
}
```

**Props:**
- `feature`: GeoJSON feature or null
- `metrics`: ElectionMetrics or null
- `loading`: boolean (optional)
- `error`: error message string or null (optional)
- `className`: additional CSS classes (optional)

**States:**
- ✓ Shows profile when feature + metrics available
- ✓ Empty state guidance when nothing selected
- ✓ Error state with message display
- ✓ Loading skeleton while fetching data

### ElectionSummaryCard

**Reusable card for election results.**

```typescript
import { ElectionSummaryCard } from "@/features/analytics";

export function WinnerCard() {
  return (
    <ElectionSummaryCard
      title="Winner"
      candidateName="Raj Kumar Singh"
      partyName="Bharatiya Janata Party"
      votes="745,328"
      accentColor="#ff9933"
      tone="amber"
      metadata={[
        { label: "Share", value: "52.4%" },
        { label: "Victory", value: "Majority" },
      ]}
    />
  );
}
```

**Props:**
- `title`: Card header (required)
- `candidateName`: Name of candidate (required)
- `partyName`: Name of party (required)
- `votes`: Formatted vote count (required)
- `accentColor`: Hex color for party indicator (optional)
- `tone`: Color theme - "blue" | "amber" | "rose" | "emerald" | "neutral" (optional)
- `metadata`: Array of label/value pairs (optional)
- `loading`: Show skeleton state (optional)
- `className`: Additional CSS classes (optional)

## Utility Functions Reference

### buildConstituencyProfile()

**Extract and build raw profile data.**

```typescript
import { buildConstituencyProfile } from "@/features/analytics";

const profile = buildConstituencyProfile(metrics, featureProperties);
// Returns: ConstituencyProfileData with all raw values
```

### formatConstituencyProfile()

**Format profile for display.**

```typescript
import { formatConstituencyProfile } from "@/features/analytics";

const formatted = formatConstituencyProfile(profile);
// Returns: FormattedConstituencyProfile with formatted strings
// - Numbers: en-IN locale (12,34,567)
// - Percentages: 2 decimal places (52.4%)
// - Votes: Comma-separated (7,45,328)
```

### getPartyColor()

**Get party's official color.**

```typescript
import { getPartyColor } from "@/features/analytics";

const color = getPartyColor("Bharatiya Janata Party"); // "#ff9933"
const color2 = getPartyColor("Indian National Congress"); // "#19AAED"
const defaultColor = getPartyColor("Unknown Party"); // "#6b7280"
```

**Supported Parties:**
- Bharatiya Janata Party, BJP
- Indian National Congress, INC, Congress
- Telugu Desam, TDP
- Yuvajana Sramika Rythu Congress Party, YSRCP
- Dravida Munnetra Kazhagam, DMK
- Shiv Sena
- Samajwadi Party
- All India Trinamool Congress, AITC, TMC
- Communist Party of India (Marxist), CPI(M)
- And more...

### getPartyTone()

**Get semantic color tone for party.**

```typescript
import { getPartyTone } from "@/features/analytics";

const tone = getPartyTone("Bharatiya Janata Party"); // "amber"
const tone2 = getPartyTone("Indian National Congress"); // "blue"
// Returns: "blue" | "amber" | "rose" | "emerald" | "neutral"
```

**Tone Mapping:**
- **Blue**: INC, YSRCP (center/left parties)
- **Amber**: BJP, TDP, Shiv Sena (center-right/regional)
- **Rose**: DMK, CPI(M), Samajwadi (left/regional)
- **Emerald**: AITC (regional)
- **Neutral**: Unknown parties

## Data Structures

### ConstituencyProfileData

Raw profile data (from database values):

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
```

### FormattedConstituencyProfile

Display-formatted profile (strings with formatting):

```typescript
interface FormattedConstituencyProfile {
  constituencyName: string;
  stateName: string;
  constituencyNumber: string;
  constituencyType: string;
  winner: {
    candidate: string;
    party: string;
    votes: string;
  };
  runnerUp: {
    candidate: string;
    party: string;
    votes: string;
  };
  metrics: {
    margin: string;
    marginPercentage: string;
    totalVotes: string;
    turnout: string;
  };
}
```

## Common Patterns

### 1. Display Constituency Profile with Data Fetching

```typescript
"use client";

import { useEffect, useState } from "react";
import { ConstituencyProfile } from "@/features/analytics";
import { loadElectionMetrics, getElectionMetrics } from "@/services/election-metrics.service";

export function MyProfileComponent() {
  const [metrics, setMetrics] = useState(null);
  const feature = useMySelectedFeature();

  useEffect(() => {
    const load = async () => {
      const index = await loadElectionMetrics();
      if (feature?.properties) {
        const props = feature.properties;
        const m = getElectionMetrics(props.state_name, props.constituency_name, index);
        setMetrics(m);
      }
    };
    load();
  }, [feature]);

  return <ConstituencyProfile feature={feature} metrics={metrics} />;
}
```

### 2. Create Custom Election Card Grid

```typescript
import { ElectionSummaryCard } from "@/features/analytics";

export function ElectionResults({ constituency }) {
  const { metrics } = constituency;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ElectionSummaryCard
        title="Winner"
        candidateName={metrics.winnerCandidate}
        partyName={metrics.winnerParty}
        votes={formatNumber(metrics.winnerVotes)}
        accentColor={getPartyColor(metrics.winnerParty)}
        tone={getPartyTone(metrics.winnerParty)}
      />

      <ElectionSummaryCard
        title="Runner-up"
        candidateName={metrics.runnerUpCandidate}
        partyName={metrics.runnerUpParty}
        votes={formatNumber(metrics.runnerUpVotes)}
        accentColor={getPartyColor(metrics.runnerUpParty)}
        tone={getPartyTone(metrics.runnerUpParty)}
      />
    </div>
  );
}
```

### 3. Format and Display Profile Data

```typescript
import {
  buildConstituencyProfile,
  formatConstituencyProfile,
} from "@/features/analytics";

export function DisplayProfile({ metrics, feature }) {
  const profile = buildConstituencyProfile(metrics, feature.properties);
  const formatted = formatConstituencyProfile(profile);

  return (
    <div>
      <h2>{formatted.constituencyName}</h2>
      <p>{formatted.stateName}</p>
      <p>Winner: {formatted.winner.candidate}</p>
      <p>Votes: {formatted.winner.votes}</p>
      <p>Margin: {formatted.metrics.margin}</p>
    </div>
  );
}
```

## Styling & Customization

### Custom CSS Classes

```typescript
<ConstituencyProfile
  feature={feature}
  metrics={metrics}
  className="my-custom-class max-w-md"
/>

<ElectionSummaryCard
  title="Winner"
  candidateName="Name"
  partyName="Party"
  votes="1,000,000"
  className="border-2 border-blue-500"
/>
```

### Color Customization

```typescript
// Pass custom accent color
<ElectionSummaryCard
  title="Winner"
  candidateName="Name"
  partyName="Party"
  votes="1,000,000"
  accentColor="#custom-hex-color"
  tone="blue" // or "amber", "rose", "emerald", "neutral"
/>
```

## Performance Tips

1. **Memoize Results:**
   ```typescript
   const formatted = useMemo(
     () => formatConstituencyProfile(profile),
     [profile]
   );
   ```

2. **Load Metrics Once:**
   ```typescript
   const metricsIndex = useMemo(() => loadElectionMetrics(), []);
   ```

3. **Use Key Props:**
   ```typescript
   <ElectionSummaryCard key={constituency.id} {...props} />
   ```

## Accessibility

Components follow WCAG 2.1 Level AA standards:
- Semantic HTML structure
- Proper heading hierarchy
- Color + additional indicators (not color alone)
- Accessible form inputs
- Keyboard navigation support
- Screen reader friendly

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Safari iOS 12+, Chrome Android

## Troubleshooting

### Profile Not Showing
- Check if `feature` prop is not null
- Verify `metrics` data is loaded
- Check console for errors

### Wrong Colors
- Verify party name matches exactly (case-sensitive)
- Use `getPartyColor()` to debug party color lookup
- Check party name in metrics data

### Numbers Not Formatting
- Ensure numbers are passed as numbers, not strings
- Check that en-IN locale is supported in browser
- Verify formatConstituencyProfile is being used

### Responsive Layout Issues
- Check that Tailwind CSS is properly configured
- Verify breakpoints (sm:, md:, lg:, xl:)
- Test on actual devices, not just browser zoom

## Support & Documentation

- Full documentation: See `CONSTITUENCY_PROFILE.md`
- Architecture details: See `CONSTITUENCY_PROFILE.md#Architecture`
- Future enhancements: See `CONSTITUENCY_PROFILE.md#Future-Enhancements`
