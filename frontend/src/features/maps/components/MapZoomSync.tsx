"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { resetMapView, zoomToBounds } from "../utils/zoom-utils";
import { selectMapViewRequest, useDashboardStore } from "@/store";

const DEFAULT_CENTER: [number, number] = [22.0, 78.0];
const DEFAULT_ZOOM = 5;
const DEFAULT_MAX_ZOOM = 10;
const DEFAULT_PADDING: [number, number] = [28, 28];

export function MapZoomSync() {
  const map = useMap();
  const mapViewRequest = useDashboardStore(selectMapViewRequest);
  const clearMapViewRequest = useDashboardStore((state) => state.clearMapViewRequest);

  useEffect(() => {
    if (!mapViewRequest) {
      return;
    }

    if (mapViewRequest.type === "reset") {
      resetMapView(map, DEFAULT_CENTER, DEFAULT_ZOOM, {
        duration: 0.45,
        animate: true,
      });
    } else {
      zoomToBounds(map, mapViewRequest.bounds, {
        maxZoom: DEFAULT_MAX_ZOOM,
        padding: DEFAULT_PADDING,
        duration: 0.45,
        animate: true,
      });
    }

    clearMapViewRequest();
  }, [clearMapViewRequest, map, mapViewRequest]);

  return null;
}
