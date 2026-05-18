import { Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Filter panel placeholder component.
 *
 * This component reserves space for data filtering controls.
 * Real filter implementation will provide:
 * - Search and text filters
 * - Date range pickers
 * - Multi-select dropdowns
 * - Category filters
 * - Apply/Reset actions
 */
export function FilterPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-amber-600" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-700">Search</label>
            <Input
              placeholder="Search datasets..."
              className="mt-1"
              disabled
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700">Region</label>
            <div className="mt-2 space-y-2">
              {["North", "South", "East", "West"].map((region) => (
                <div key={region} className="flex items-center gap-2">
                  <input type="checkbox" id={region} disabled className="h-3 w-3" />
                  <label
                    htmlFor={region}
                    className="text-xs text-zinc-600 cursor-not-allowed"
                  >
                    {region}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700">Date Range</label>
            <Input
              type="date"
              className="mt-1"
              disabled
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled
          >
            Reset
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            disabled
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
