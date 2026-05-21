"use client";

import { useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { defaultAttribution, defaultTileLayerUrl } from "../utils/map-utils";
import { IndiaGeoJSONLayer } from "./IndiaGeoJSONLayer";
import { useIndiaGeoJSON } from "../hooks/useIndiaGeoJSON";
import { useMapZoom } from "../hooks/useMapZoom";

import type {
  GeoJSONFeature,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";

import { getSelectedFeatureInfo } from "../utils/feature-info";

const DEFAULT_CENTER: [number, number] = [22.0, 78.0];
const DEFAULT_ZOOM = 5;

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
  const {
    stateName,
    constituencyName,
    constituencyNumber,
  } = getSelectedFeatureInfo(feature);

  return (
    <div className="absolute right-4 top-16 z-[1200] w-60 rounded-lg bg-slate-900/85 p-3 text-white shadow-xl backdrop-blur-sm">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            State
          </p>

          <p className="mt-1 text-base font-semibold leading-tight">
            {stateName}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            Constituency
          </p>

          <p className="mt-1 text-sm font-medium leading-tight">
            {constituencyName}
            {constituencyNumber
              ? ` (${constituencyNumber})`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LeafletMap() {
  const { data, loading, error } = useIndiaGeoJSON(
    "india_pc_2019",
    {
      cacheKey: "india-parliamentary-constituencies",
    },
  );

  const [selectedFeature, setSelectedFeature] =
    useState<
      GeoJSONFeature<IndiaStateGeoJSONProperties> | null
    >(null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={defaultTileLayerUrl()}
          attribution={defaultAttribution()}
        />

        <MapResetControl />

        {data ? (
          <IndiaGeoJSONLayer
            data={data}
            onSelectFeature={setSelectedFeature}
            onDeselectFeature={() =>
              setSelectedFeature(null)
            }
          />
        ) : null}
      </MapContainer>

      {selectedFeature ? (
        <SelectedFeatureInfoPanel
          feature={selectedFeature}
        />
      ) : null}

      <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200">
        {loading && "Loading India GeoJSON..."}

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
