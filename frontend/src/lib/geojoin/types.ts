import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../types/geojson';

export interface ConstituencyAnalyticsRecord {
  constituency_id: string;
  winning_party?: string;
  turnout_percentage?: number;
  population?: number;
  [key: string]: unknown;
}

export type ConstituencyJoinKey = string;

export interface JoinStatus {
  readonly joinStatus: 'matched' | 'unmatched' | 'missing-data';
}

export interface GeoJSONJoinProperties<TAnalytics extends ConstituencyAnalyticsRecord = ConstituencyAnalyticsRecord> {
  readonly analytics?: TAnalytics;
  readonly joinStatus: JoinStatus['joinStatus'];
}

export type JoinedGeoJSONFeature<TProperties, TAnalytics extends ConstituencyAnalyticsRecord = ConstituencyAnalyticsRecord> =
  GeoJSONFeature<TProperties & GeoJSONJoinProperties<TAnalytics>>;

export type JoinedGeoJSONFeatureCollection<TProperties, TAnalytics extends ConstituencyAnalyticsRecord = ConstituencyAnalyticsRecord> =
  GeoJSONFeatureCollection<TProperties & GeoJSONJoinProperties<TAnalytics>>;

export interface GeoJSONJoinOptions<TProperties, TAnalytics extends ConstituencyAnalyticsRecord> {
  analyticsKeySelector?: (record: TAnalytics) => string | null | undefined;
  geoKeySelector?: (properties: TProperties) => string | null | undefined;
  normalizer?: (rawKey: string | null | undefined) => ConstituencyJoinKey | null;
  fallbackAnalytics?: Partial<TAnalytics>;
}

export interface ParsedAnalyticsRow {
  constituency_id: string;
  winning_party?: string;
  turnout_percentage?: number;
  population?: number;
  [key: string]: unknown;
}
