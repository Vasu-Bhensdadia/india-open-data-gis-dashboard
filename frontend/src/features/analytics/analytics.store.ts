import { create } from "zustand";

import {
  ANALYTICS_CHART_DEFINITIONS,
  DEFAULT_ANALYTICS_CHART_LAYOUT,
  DEFAULT_ANALYTICS_CHART_ORDER,
  DEFAULT_ANALYTICS_DATA_SOURCE_PREFERENCE,
} from "./charts/chart-config";
import type {
  AnalyticsChartDataSourcePreference,
  AnalyticsChartDefinition,
  AnalyticsChartId,
  AnalyticsChartLayoutMode,
} from "./charts/types";

export interface AnalyticsStoreState {
  chartDefinitions: Record<AnalyticsChartId, AnalyticsChartDefinition>;
  activeChartIds: AnalyticsChartId[];
  selectedChartId: AnalyticsChartId | null;
  dataSourcePreference: AnalyticsChartDataSourcePreference;
  layoutMode: AnalyticsChartLayoutMode;
}

export interface AnalyticsStoreActions {
  setChartDefinitions: (definitions: Partial<Record<AnalyticsChartId, AnalyticsChartDefinition>>) => void;
  setActiveChartIds: (chartIds: AnalyticsChartId[]) => void;
  toggleChartVisibility: (chartId: AnalyticsChartId) => void;
  setSelectedChartId: (chartId: AnalyticsChartId | null) => void;
  setDataSourcePreference: (preference: AnalyticsChartDataSourcePreference) => void;
  setLayoutMode: (mode: AnalyticsChartLayoutMode) => void;
  resetAnalyticsState: () => void;
}

export type AnalyticsStore = AnalyticsStoreState & AnalyticsStoreActions;

function sanitizeChartIds(chartIds: AnalyticsChartId[]) {
  const seen = new Set<AnalyticsChartId>();
  return DEFAULT_ANALYTICS_CHART_ORDER.filter((chartId) => {
    if (!chartIds.includes(chartId) || seen.has(chartId)) {
      return false;
    }
    seen.add(chartId);
    return true;
  });
}

const defaultChartDefinitions = ANALYTICS_CHART_DEFINITIONS;
const defaultActiveChartIds = DEFAULT_ANALYTICS_CHART_ORDER.filter(
  (chartId) => defaultChartDefinitions[chartId]?.defaultVisible,
);

export const useAnalyticsStore = create<AnalyticsStore>()((set) => ({
  chartDefinitions: defaultChartDefinitions,
  activeChartIds: defaultActiveChartIds,
  selectedChartId: null,
  dataSourcePreference: DEFAULT_ANALYTICS_DATA_SOURCE_PREFERENCE,
  layoutMode: DEFAULT_ANALYTICS_CHART_LAYOUT,

  setChartDefinitions: (definitions) =>
    set((state) => ({
      chartDefinitions: {
        ...state.chartDefinitions,
        ...definitions,
      },
    })),

  setActiveChartIds: (chartIds) =>
    set(() => ({
      activeChartIds: sanitizeChartIds(chartIds),
    })),

  toggleChartVisibility: (chartId) =>
    set((state) => {
      const nextIds = new Set(state.activeChartIds);

      if (nextIds.has(chartId)) {
        nextIds.delete(chartId);
      } else {
        nextIds.add(chartId);
      }

      return {
        activeChartIds: sanitizeChartIds(Array.from(nextIds)),
      };
    }),

  setSelectedChartId: (chartId) =>
    set({
      selectedChartId: chartId,
    }),

  setDataSourcePreference: (preference) =>
    set({
      dataSourcePreference: preference,
    }),

  setLayoutMode: (mode) =>
    set({
      layoutMode: mode,
    }),

  resetAnalyticsState: () =>
    set({
      chartDefinitions: defaultChartDefinitions,
      activeChartIds: defaultActiveChartIds,
      selectedChartId: null,
      dataSourcePreference: DEFAULT_ANALYTICS_DATA_SOURCE_PREFERENCE,
      layoutMode: DEFAULT_ANALYTICS_CHART_LAYOUT,
    }),
}));

export const selectAnalyticsChartDefinitions = (state: AnalyticsStore) => state.chartDefinitions;
export const selectActiveAnalyticsChartIds = (state: AnalyticsStore) => state.activeChartIds;
export const selectSelectedAnalyticsChartId = (state: AnalyticsStore) => state.selectedChartId;
export const selectAnalyticsDataSourcePreference = (state: AnalyticsStore) => state.dataSourcePreference;
export const selectAnalyticsLayoutMode = (state: AnalyticsStore) => state.layoutMode;

export const selectVisibleAnalyticsChartDefinitions = (state: AnalyticsStore) =>
  state.activeChartIds
    .map((chartId) => state.chartDefinitions[chartId])
    .filter((definition): definition is AnalyticsChartDefinition => Boolean(definition));

