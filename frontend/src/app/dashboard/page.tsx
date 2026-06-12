"use client";

import { MapSection } from "@/features/maps/components/map-section";
import { AnalyticsPanel } from "@/features/analytics/components/analytics-panel";
import { FilterPanel } from "@/features/filters/components/filter-panel";
import { SearchBar } from "@/features/search";
import { useDashboardUrlSync, ShareButton } from "@/features/sharing";

/**
 * Main dashboard page.
 *
 * Layout structure:
 * - Top: Header with navigation
 * - Left sidebar: Navigation menu
 * - Main content area:
 *   - Left column: Large map visualization
 *   - Right column: Analytics and filters panels
 *
 * URL state synchronization is handled by useDashboardUrlSync which:
 * - Restores dashboard state from URL query params on mount
 * - Keeps URL query params in sync as the user interacts with the dashboard
 */
export default function DashboardPage() {
  useDashboardUrlSync();

  return (
    <div className="w-full h-full p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Geospatial analytics and open data visualization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton />
          <SearchBar className="md:hidden" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content: Map section */}
        <div className="lg:col-span-2">
          <MapSection />
        </div>

        {/* Right sidebar: Analytics and filters */}
        <div className="space-y-6">
          <AnalyticsPanel />
          <FilterPanel />
        </div>
      </div>
    </div>
  );
}
