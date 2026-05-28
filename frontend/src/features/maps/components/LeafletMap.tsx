"use client";

import type { GeoJsonObject } from "geojson";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { defaultAttribution, defaultTileLayerUrl } from "../utils/map-utils";
import { IndiaGeoJSONLayer } from "./IndiaGeoJSONLayer";
import { LeafletControl } from "./LeafletControl";
import { useIndiaGeoJSON } from "../hooks/useIndiaGeoJSON";
import { useMapZoom } from "../hooks/useMapZoom";
import { useFilteredGeoJSON } from "@/features/filters";
import {
  createChoroplethMetricConfig,
  getChoroplethMetricLegendConfig,
} from "../utils/choropleth-style";
import { ChoroplethMetricSelector } from "./ChoroplethMetricSelector";
import MapLegend from "@/components/map-legend/MapLegend";
import {
  selectIsChoroplethConfigLoaded,
  selectSelectedConstituencyId,
  selectSelectedFeature,
  selectSelectedMetricKey,
  useDashboardStore,
} from "@/store";
import { useDashboardFeatureSync } from "@/features/analytics/hooks/useDashboardFeatureSync";

import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";
import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "../types/choropleth";

import { getSelectedFeatureInfo } from "../utils/feature-info";

const DEFAULT_CENTER: [number, number] = [22.0, 78.0];
const DEFAULT_ZOOM = 5;

function MapPanes() {
  const map = useMap();

  useEffect(() => {
    const paneConfigs = [
      { name: "choroplethPane", zIndex: 450 },
      { name: "stateBoundaryPane", zIndex: 460 },
      { name: "choroplethHoverPane", zIndex: 550 },
      { name: "choroplethSelectionPane", zIndex: 560 },
    ];

    paneConfigs.forEach(({ name, zIndex }) => {
      const existingPane = map.getPane(name);
      if (!existingPane) {
        const pane = map.createPane(name);
        pane.style.zIndex = String(zIndex);
      } else {
        existingPane.style.zIndex = String(zIndex);
      }
    });
  }, [map]);

  return null;
}

function MapResetControl() {
  const map = useMap();

  const { resetMapView } = useMapZoom(map, {
    defaultCenter: DEFAULT_CENTER,
    defaultZoom: DEFAULT_ZOOM,
    duration: 0.4,
  });

  return (
    <button
      type="button"
      className="pointer-events-auto absolute right-4 top-4 z-[1000] inline-flex items-center rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
      onClick={resetMapView}
    >
      Reset view
    </button>
  );
}

function SelectedFeatureInfoPanel({
  feature,
}: {
  feature: GeoJSONFeature<IndiaStateGeoJSONProperties>;
}) {
  const { stateName, constituencyName, constituencyNumber } = getSelectedFeatureInfo(feature);

  return (
    <div className="absolute right-4 top-16 z-[1200] w-60 rounded-lg bg-slate-900/85 p-3 text-white shadow-xl backdrop-blur-sm">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">State</p>

          <p className="mt-1 text-base font-semibold leading-tight">{stateName}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Constituency</p>

          <p className="mt-1 text-sm font-medium leading-tight">
            {constituencyName}
            {constituencyNumber ? ` (${constituencyNumber})` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LeafletMap() {
  const { data, loading, error } = useIndiaGeoJSON("india_pc_2019", {
    cacheKey: "india-parliamentary-constituencies",
  });

  // ---> ADD THESE LINES: Fetch the state boundaries <---
  const [stateBoundaries, setStateBoundaries] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/state_geojson_for_website.geojson")
      .then((response) => response.json())
      .then((jsonData) => setStateBoundaries(jsonData))
      .catch((err) => console.error("Error loading state boundaries:", err));
  }, []);
  // ----------------------------------------------------

  const selectedMetricKey = useDashboardStore(selectSelectedMetricKey);
  const metricConfig = useDashboardStore((state) => state.metricConfig);
  const isConfigLoaded = useDashboardStore(selectIsChoroplethConfigLoaded);
  const setMetricConfig = useDashboardStore((state) => state.setMetricConfig);
  const selectedConstituencyId = useDashboardStore(selectSelectedConstituencyId);
  const selectedFeature = useDashboardStore(
    selectSelectedFeature,
  ) as GeoJSONFeature<IndiaStateGeoJSONProperties> | null;
  const {
    syncHoverFeature,
    clearHoverFeature,
    syncSelectionFeature,
    clearSelectionFeature,
  } = useDashboardFeatureSync();

  useEffect(() => {
    if (isConfigLoaded) {
      return;
    }

    let cancelled = false;

    void createChoroplethMetricConfig()
      .then((config) => {
        if (!cancelled) {
          setMetricConfig(
            config as Record<
              ChoroplethMetricKey,
              ChoroplethMetricDescriptor<Record<string, unknown>>
            >,
          );
        }
      })
      .catch((loadError) => {
        console.error("Failed to load choropleth metric configuration", loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [isConfigLoaded, setMetricConfig]);

  const selectedMetric = useMemo(() => {
    if (!isConfigLoaded) return undefined;

    return (
      metricConfig[selectedMetricKey] ??
      metricConfig.boundaryOnly ??
      Object.values(metricConfig).find(Boolean)
    );
  }, [selectedMetricKey, metricConfig, isConfigLoaded]);

  const selectedMetricLegendConfig = useMemo(
    () => (selectedMetric ? getChoroplethMetricLegendConfig(selectedMetric) : undefined),
    [selectedMetric],
  );

  const filteredGeoJSON = useFilteredGeoJSON(
    data as GeoJSONFeatureCollection<Record<string, unknown>> | null,
  );
  // const visibleGeoJSON = filteredGeoJSON
  //   ? (filteredGeoJSON as GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>)
  //   : data;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapPanes />

        <TileLayer url={defaultTileLayerUrl()} attribution={defaultAttribution()} />

        <MapResetControl />

        {data && isConfigLoaded && selectedMetric ? (
          <IndiaGeoJSONLayer
            data={data as GeoJSONFeatureCollection<IndiaStateGeoJSONProperties>}
            filteredFeatures={
              filteredGeoJSON?.features as GeoJSONFeature<IndiaStateGeoJSONProperties>[] | null
            }
            metric={selectedMetric as ChoroplethMetricDescriptor<IndiaStateGeoJSONProperties>}
            selectedFeatureId={selectedConstituencyId}
            selectedFeature={selectedFeature}
            onHoverFeature={syncHoverFeature}
            onLeaveFeature={clearHoverFeature}
            onSelectFeature={syncSelectionFeature}
            onDeselectFeature={clearSelectionFeature}
          />
        ) : null}

        {/* ---> ADD THIS NEW BLOCK: The State Boundary Layer (Top) <--- */}
        {stateBoundaries ? (
          <GeoJSON
            key="india-state-boundaries"
            data={stateBoundaries as GeoJsonObject}
            pane="stateBoundaryPane"
            style={{
              fillOpacity: 0, // Completely transparent inside so constituency colors show through
              color: "#000000", // Solid black state borders
              weight: 2, // Thicker line so it stands out above constituencies
              opacity: 0.9, // Very high opacity for a sharp, dark line
            }}
            interactive={false} // CRITICAL: This lets your mouse "click through" to hover over constituencies!
          />
        ) : null}
        {/* ----------------------------------------------------------- */}

        <LeafletControl position="topleft" className="!pointer-events-auto">
          <ChoroplethMetricSelector />
        </LeafletControl>

        {selectedMetricLegendConfig ? (
          <LeafletControl position="bottomright" className="!pointer-events-auto">
            <MapLegend config={selectedMetricLegendConfig} position="floating" />
          </LeafletControl>
        ) : null}
      </MapContainer>

      {selectedFeature ? <SelectedFeatureInfoPanel feature={selectedFeature} /> : null}

      <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200">
        <div className="font-semibold">
          {selectedMetric?.label ?? "Loading metric configuration..."}
        </div>
        {(loading || !isConfigLoaded) && "Loading map data..."}

        {error && "Unable to load map data."}
      </div>

      {error ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[1000] rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 shadow-sm ring-1 ring-rose-200">
          {error.message}
        </div>
      ) : null}
    </div>
  );
}
