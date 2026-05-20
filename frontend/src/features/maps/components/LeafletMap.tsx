"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { defaultAttribution, defaultTileLayerUrl } from "../utils/map-utils";
import { IndiaGeoJSONLayer } from "./IndiaGeoJSONLayer";
import { useIndiaGeoJSON } from "../hooks/useIndiaGeoJSON";

const DEFAULT_CENTER: [number, number] = [22.0, 78.0];
const DEFAULT_ZOOM = 5;

export function LeafletMap() {
  const { data, loading, error } = useIndiaGeoJSON("india_pc_2019", {
    cacheKey: "india-parliamentary-constituencies",
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={defaultTileLayerUrl()} attribution={defaultAttribution()} />
        {data ? <IndiaGeoJSONLayer data={data} /> : null}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200">
        {loading && "Loading India GeoJSON..."}
        {error && `Unable to load map data.`}
      </div>
      {error ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 shadow-sm ring-1 ring-rose-200">
          {error.message}
        </div>
      ) : null}
    </div>
  );
}
