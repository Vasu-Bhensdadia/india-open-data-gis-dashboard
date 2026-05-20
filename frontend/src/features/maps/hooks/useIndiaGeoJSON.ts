"use client";

import { useEffect, useState } from "react";

import { geoJSONService } from "@/services/geojson.service";
import { env } from "@/config/env";
import type {
  GeoJSONFeatureCollection,
  GeoJSONLoadOptions,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";

export interface IndiaGeoJSONState {
  data: GeoJSONFeatureCollection<IndiaStateGeoJSONProperties> | null;
  loading: boolean;
  error: Error | null;
}

export function useIndiaGeoJSON(
  resourceId: string,
  options?: GeoJSONLoadOptions,
): IndiaGeoJSONState {
  const [data, setData] = useState<GeoJSONFeatureCollection<IndiaStateGeoJSONProperties> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const collection = await geoJSONService.loadIndiaStateCollection(
          env.NEXT_PUBLIC_API_URL,
          resourceId,
          options,
        );

        if (mounted) {
          setData(collection);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [resourceId, options, options?.cacheKey, options?.forceReload, options?.signal]);

  return {
    data,
    loading,
    error,
  };
}
