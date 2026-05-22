import { create } from "zustand";
import type { ChoroplethMetricKey } from "./types/choropleth";

export interface ChoroplethModeState {
  selectedMetricKey: ChoroplethMetricKey;
  setSelectedMetricKey: (metricKey: ChoroplethMetricKey) => void;
}

export const useChoroplethModeStore = create<ChoroplethModeState>()((set) => ({
  selectedMetricKey: "turnout",
  setSelectedMetricKey: (selectedMetricKey) => set({ selectedMetricKey }),
}));
