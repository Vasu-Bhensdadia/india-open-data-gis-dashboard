import type { GeoJSONLoadOptions } from "@/types/geojson";

export enum GeoJSONLoadErrorCode {
  NetworkError = "NETWORK_ERROR",
  HttpError = "HTTP_ERROR",
  ParseError = "PARSE_ERROR",
  InvalidPayload = "INVALID_PAYLOAD",
}

export class GeoJSONLoadError extends Error {
  public readonly code: GeoJSONLoadErrorCode;
  public readonly url: string;
  public readonly original?: unknown;

  constructor(code: GeoJSONLoadErrorCode, message: string, url: string, original?: unknown) {
    super(message);
    this.name = "GeoJSONLoadError";
    this.code = code;
    this.url = url;
    this.original = original;
  }
}

export type GeoJSONCacheKey = string;

interface GeoJSONCacheEntry<T> {
  value: T;
  createdAt: number;
}

export class GeoJSONCacheManager {
  private readonly cache = new Map<GeoJSONCacheKey, GeoJSONCacheEntry<unknown>>();

  public get<T>(key: GeoJSONCacheKey): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: GeoJSONCacheKey, value: T): void {
    this.cache.set(key, { value, createdAt: Date.now() });
  }

  public clear(key?: GeoJSONCacheKey): void {
    if (key) {
      this.cache.delete(key);
      return;
    }

    this.cache.clear();
  }
}

const cacheManager = new GeoJSONCacheManager();

export function buildGeoJSONCacheKey(url: string, options?: GeoJSONLoadOptions): GeoJSONCacheKey {
  return `${options?.cacheKey ?? url}:${options?.forceReload ? "fresh" : "cached"}`;
}

export async function fetchGeoJSON<T>(url: string, options?: GeoJSONLoadOptions): Promise<T> {
  const cacheKey = buildGeoJSONCacheKey(url, options);

  if (!options?.forceReload) {
    const cached = cacheManager.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: options?.signal,
    });
  } catch (error) {
    throw new GeoJSONLoadError(
      GeoJSONLoadErrorCode.NetworkError,
      `Failed to fetch GeoJSON from ${url}`,
      url,
      error,
    );
  }

  if (!response.ok) {
    throw new GeoJSONLoadError(
      GeoJSONLoadErrorCode.HttpError,
      `GeoJSON request failed with status ${response.status}`,
      url,
      response.status,
    );
  }

  let payload: T;

  try {
    payload = (await response.json()) as T;
  } catch (error) {
    throw new GeoJSONLoadError(
      GeoJSONLoadErrorCode.ParseError,
      `Failed to parse GeoJSON response from ${url}`,
      url,
      error,
    );
  }

  cacheManager.set(cacheKey, payload);
  return payload;
}

export function resolveGeoJSONUrl(baseUrl: string, resourcePath: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(resourcePath, normalizedBaseUrl).toString();
}
