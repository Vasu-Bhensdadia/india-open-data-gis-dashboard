import { MapSection } from "@/features/maps/components/map-section";
import { AnalyticsPanel } from "@/features/analytics/components/analytics-panel";
import { FilterPanel } from "@/features/filters/components/filter-panel";

/**
 * Main dashboard page.
 *
 * Layout structure:
 * - Top: Header with navigation
 * - Left sidebar: Navigation menu
 * - Main content area:
 *   - Left column: Large map visualization
 *   - Right column: Analytics and filters panels
 */
export default function DashboardPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-950">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Geospatial analytics and open data visualization
        </p>
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
