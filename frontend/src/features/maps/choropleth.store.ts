import { create } from "zustand";
import type { ChoroplethMetricKey, ChoroplethMetricDescriptor } from "./types/choropleth";
import { createChoroplethMetricConfig, CHOROPLETH_METRIC_CONFIG } from "./utils/choropleth-style";

export interface ChoroplethModeState {
  selectedMetricKey: ChoroplethMetricKey;
  setSelectedMetricKey: (metricKey: ChoroplethMetricKey) => void;
  metricConfig: Record<ChoroplethMetricKey, ChoroplethMetricDescriptor<Record<string, unknown>>>;
  isConfigLoaded: boolean;
  loadConfig: () => Promise<void>;
}

export const useChoroplethModeStore = create<ChoroplethModeState>()((set, get) => ({
  selectedMetricKey: "marginPercentage",
  setSelectedMetricKey: (selectedMetricKey) => set({ selectedMetricKey }),
  metricConfig: CHOROPLETH_METRIC_CONFIG,
  isConfigLoaded: false,
  loadConfig: async () => {
    if (get().isConfigLoaded) return;
    try {
      const config = await createChoroplethMetricConfig();
      set({ metricConfig: config, isConfigLoaded: true });
    } catch (error) {
      console.error("Failed to load metric config", error);
    }
  },
}));
