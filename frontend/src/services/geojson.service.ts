import type {
  GeoJSONFeatureCollection,
  GeoJSONLoadOptions,
  GeoJSONResourceDescriptor,
  IndiaStateGeoJSONProperties,
} from "@/types/geojson";
import { fetchGeoJSON, resolveGeoJSONUrl } from "./geojson.utils";

export interface GeoJSONService {
  loadCollection<TProperties = Record<string, unknown>>(
    resource: GeoJSONResourceDescriptor,
    options?: GeoJSONLoadOptions,
  ): Promise<GeoJSONFeatureCollection<TProperties>>;

  buildGeoJSONResource(
    id: string,
    name: string,
    baseUrl: string,
    relativePath: string,
  ): GeoJSONResourceDescriptor;

  buildIndiaStateResource(
    baseUrl: string,
    stateId: string,
    resourceName?: string,
  ): GeoJSONResourceDescriptor;

  loadIndiaStateCollection<
    TProperties = IndiaStateGeoJSONProperties,
  >(
    baseUrl: string,
    stateId: string,
    options?: GeoJSONLoadOptions,
  ): Promise<GeoJSONFeatureCollection<TProperties>>;
}

async function loadCollection<TProperties = Record<string, unknown>>(
  resource: GeoJSONResourceDescriptor,
  options?: GeoJSONLoadOptions,
): Promise<GeoJSONFeatureCollection<TProperties>> {
  return fetchGeoJSON<GeoJSONFeatureCollection<TProperties>>(resource.url, options);
}

function buildGeoJSONResource(
  id: string,
  name: string,
  baseUrl: string,
  relativePath: string,
): GeoJSONResourceDescriptor {
  return {
    id,
    name,
    url: resolveGeoJSONUrl(baseUrl, relativePath),
  };
}

function buildIndiaStateResource(
  baseUrl: string,
  stateId: string,
  resourceName?: string,
): GeoJSONResourceDescriptor {
  return buildGeoJSONResource(
    stateId,
    resourceName ?? `India state ${stateId}`,
    baseUrl,
    `india/${stateId}`,
  );
}

async function loadIndiaStateCollection<
  TProperties = IndiaStateGeoJSONProperties,
>(
  baseUrl: string,
  stateId: string,
  options?: GeoJSONLoadOptions,
): Promise<GeoJSONFeatureCollection<TProperties>> {
  const resource = buildIndiaStateResource(baseUrl, stateId);
  return loadCollection<TProperties>(resource, options);
}

export const geoJSONService: GeoJSONService = {
  loadCollection,
  buildGeoJSONResource,
  buildIndiaStateResource,
  loadIndiaStateCollection,
};
