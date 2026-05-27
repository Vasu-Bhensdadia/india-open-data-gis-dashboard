"use client";

import { useEffect, useMemo, useState } from "react";

import {
  selectActiveMetricDescriptor,
  selectSelectedFeature,
  selectSelectedMetricKey,
  useDashboardStore,
} from "@/store";
import type { ChoroplethMetricDescriptor, ChoroplethMetricKey } from "@/features/maps/types/choropleth";
import type { ElectionMetricsIndex } from "@/services/election-metrics.service";
import type { GeoJSONFeature } from "@/types/geojson";
import { useFilterEngine } from "@/features/filters/hooks/useFilterEngine";
import {
  buildDashboardKpiMetrics,
  calculateAnalyticsSummary,
} from "../utils/analytics-calculations";
import type {
  AnalyticsProvider,
  DashboardAnalyticsSummary,
  DashboardKpiMetric,
} from "../types/analytics.types";

export interface UseDashboardAnalyticsOptions {
  provider?: AnalyticsProvider | null;
}

export interface DashboardAnalyticsState {
  summary: DashboardAnalyticsSummary | null;
  kpiMetrics: DashboardKpiMetric[];
  isLoading: boolean;
  error: Error | null;
  filteredFeatures: GeoJSONFeature<Record<string, unknown>>[] | null;
  metricsIndex: ElectionMetricsIndex | null;
  totalFeatureCount: number;
  filteredFeatureCount: number;
  selectedMetric: ChoroplethMetricDescriptor<Record<string, unknown>> | null;
  selectedMetricKey: ChoroplethMetricKey;
}

export function useDashboardAnalytics(
  features: GeoJSONFeature<Record<string, unknown>>[] | null,
  options: UseDashboardAnalyticsOptions = {},
): DashboardAnalyticsState {
  const { provider } = options;
  const { filteredFeatures, metricsIndex, isLoadingMetrics, metricsError } =
    useFilterEngine(features);

  const selectedFeature = useDashboardStore(selectSelectedFeature);
  const selectedMetric = useDashboardStore(selectActiveMetricDescriptor);
  const selectedMetricKey = useDashboardStore(selectSelectedMetricKey);

  const totalFeatureCount = features?.length ?? 0;
  const filteredFeatureCount = filteredFeatures?.length ?? 0;
  const shouldUseProvider = Boolean(provider && filteredFeatures && metricsIndex);

  const clientSummary = useMemo(() => {
    if (!filteredFeatures || !metricsIndex) {
      return null;
    }

    return calculateAnalyticsSummary({
      features: filteredFeatures,
      allFeatureCount: totalFeatureCount,
      metricsIndex,
      selectedFeature,
      selectedMetric,
      selectedMetricKey,
      source: "client",
    });
  }, [
    filteredFeatures,
    metricsIndex,
    totalFeatureCount,
    selectedFeature,
    selectedMetric,
    selectedMetricKey,
  ]);

  const [providerSummary, setProviderSummary] = useState<DashboardAnalyticsSummary | null>(null);
  const [providerError, setProviderError] = useState<Error | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!shouldUseProvider || !provider || !filteredFeatures || !metricsIndex) {
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      setProviderSummary(null);
      setIsCalculating(true);
      setProviderError(null);

      try {
        const summary = await provider.calculateSummary({
          features: filteredFeatures,
          allFeatureCount: totalFeatureCount,
          metricsIndex,
          selectedFeature,
          selectedMetric,
          selectedMetricKey,
          source: provider.source,
        });

        if (!cancelled) {
          setProviderSummary(summary);
        }
      } catch (error) {
        if (!cancelled) {
          setProviderSummary(null);
          setProviderError(error instanceof Error ? error : new Error("Failed to load analytics"));
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    provider,
    filteredFeatures,
    metricsIndex,
    totalFeatureCount,
    selectedFeature,
    selectedMetric,
    selectedMetricKey,
    shouldUseProvider,
  ]);

  const summary = shouldUseProvider ? (providerSummary ?? clientSummary) : clientSummary;
  const kpiMetrics = useMemo(() => (summary ? buildDashboardKpiMetrics(summary) : []), [summary]);

  return {
    summary,
    kpiMetrics,
    isLoading: isLoadingMetrics || (shouldUseProvider && isCalculating),
    error: metricsError ?? (shouldUseProvider ? providerError : null),
    filteredFeatures,
    metricsIndex,
    totalFeatureCount,
    filteredFeatureCount,
    selectedMetric,
    selectedMetricKey,
  };
}
