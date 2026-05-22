import type { GeoJSONFeatureCollection } from '../../types/geojson';
import type {
  ConstituencyAnalyticsRecord,
  ConstituencyJoinKey,
  GeoJSONJoinOptions,
  JoinedGeoJSONFeature,
  JoinedGeoJSONFeatureCollection,
  ParsedAnalyticsRow,
} from './types';

export function normalizeJoinKey(raw: string | number | null | undefined): ConstituencyJoinKey | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  return String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
}

export function defaultAnalyticsKeySelector(record: ConstituencyAnalyticsRecord): string | null {
  return normalizeJoinKey(record.constituency_id);
}

export function defaultGeoKeySelector<TProperties>(properties: TProperties & Record<string, unknown>): string | null {
  const candidate = properties['constituency_id'] ?? properties['constituencyId'] ?? properties['id'];
  return normalizeJoinKey(candidate as string | number | null | undefined);
}

export function buildAnalyticsIndex<TAnalytics extends ConstituencyAnalyticsRecord>(
  records: TAnalytics[],
  options: Pick<GeoJSONJoinOptions<unknown, TAnalytics>, 'analyticsKeySelector' | 'normalizer'> = {},
): Map<ConstituencyJoinKey, TAnalytics> {
  const index = new Map<ConstituencyJoinKey, TAnalytics>();
  const selector = options.analyticsKeySelector ?? defaultAnalyticsKeySelector;
  const normalizer = options.normalizer ?? normalizeJoinKey;

  for (const record of records) {
    const rawKey = selector(record);
    const key = normalizer(rawKey);
    if (key) {
      index.set(key, record);
    }
  }

  return index;
}

export function joinGeoJSONWithAnalytics<TProperties, TAnalytics extends ConstituencyAnalyticsRecord>(
  featureCollection: GeoJSONFeatureCollection<TProperties>,
  analyticsRecords: TAnalytics[],
  options: GeoJSONJoinOptions<TProperties, TAnalytics> = {},
): JoinedGeoJSONFeatureCollection<TProperties, TAnalytics> {
  const analyticsIndex = buildAnalyticsIndex(analyticsRecords, options);
  const geoKeySelector = options.geoKeySelector ?? ((props: TProperties) => defaultGeoKeySelector(props as TProperties & Record<string, unknown>));
  const normalizer = options.normalizer ?? normalizeJoinKey;

  const joinedFeatures = featureCollection.features.map(feature => {
    const rawGeoKey = geoKeySelector(feature.properties);
    const key = normalizer(rawGeoKey);
    const matchedAnalytics = key ? analyticsIndex.get(key) : undefined;
    const joinStatus = matchedAnalytics
      ? 'matched'
      : rawGeoKey
      ? 'missing-data'
      : 'unmatched';

    return {
      ...feature,
      properties: {
        ...feature.properties,
        analytics: matchedAnalytics ? { ...matchedAnalytics, ...options.fallbackAnalytics } : undefined,
        joinStatus,
      },
    } as JoinedGeoJSONFeature<TProperties, TAnalytics>;
  });

  return {
    ...featureCollection,
    features: joinedFeatures,
  };
}

export function parseAnalyticsRow(
  rawRow: Record<string, string | number | boolean | null | undefined>,
): ParsedAnalyticsRow {
  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(rawRow)) {
    const key = String(rawKey).trim().toLowerCase().replace(/\s+/g, '_');
    normalized[key] = value;
  }

  const parsed: ParsedAnalyticsRow = {
    constituency_id: String(normalized['constituency_id'] ?? normalized['constituencyid'] ?? normalized['id'] ?? '').trim(),
  };

  if (normalized['winning_party'] !== undefined) {
    parsed.winning_party = String(normalized['winning_party'] ?? '').trim();
  }

  if (normalized['turnout_percentage'] !== undefined) {
    parsed.turnout_percentage = parseNumber(normalized['turnout_percentage']);
  }

  if (normalized['population'] !== undefined) {
    parsed.population = parseNumber(normalized['population']);
  }

  return parsed;
}

function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mergeAnalyticsRecords<TAnalytics extends ConstituencyAnalyticsRecord>(
  existing: TAnalytics[],
  incoming: TAnalytics[],
): TAnalytics[] {
  const mergedIndex = new Map<string, TAnalytics>();

  for (const record of existing) {
    const key = normalizeJoinKey(record.constituency_id);
    if (key) {
      mergedIndex.set(key, record);
    }
  }

  for (const record of incoming) {
    const key = normalizeJoinKey(record.constituency_id);
    if (key) {
      const existingRecord = mergedIndex.get(key);
      mergedIndex.set(key, existingRecord ? { ...existingRecord, ...record } : record);
    }
  }

  return Array.from(mergedIndex.values());
}
