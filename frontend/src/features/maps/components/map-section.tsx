import { Map } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Map section placeholder component.
 *
 * This component reserves space for the interactive map visualization.
 * Real map implementation (with Leaflet, Mapbox, or similar) will replace
 * the placeholder content here.
 *
 * Features to be added:
 * - Interactive geospatial visualization
 * - Layer controls
 * - Zoom and pan controls
 * - Data overlay rendering
 */
export function MapSection() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-emerald-600" />
          Geospatial Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50">
          <div className="text-center">
            <Map className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-2 text-sm font-medium text-zinc-600">Map placeholder</p>
            <p className="text-xs text-zinc-500">Interactive map will be rendered here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
