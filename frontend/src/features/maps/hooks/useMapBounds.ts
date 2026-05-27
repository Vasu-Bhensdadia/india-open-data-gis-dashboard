/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, type RefObject } from "react";

export function useFitBoundsFromLayer(map: any, layerRef: RefObject<any>) {
  useEffect(() => {
    if (!map || !layerRef.current || typeof layerRef.current.getBounds !== "function") {
      return;
    }

    const bounds = layerRef.current.getBounds();

    if (bounds) {
      map.fitBounds(bounds, {
        padding: [32, 32],
        maxZoom: 9,
      });
    }
  }, [map, layerRef]);
}
