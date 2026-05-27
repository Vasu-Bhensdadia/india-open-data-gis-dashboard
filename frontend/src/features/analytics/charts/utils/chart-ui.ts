import type { CSSProperties } from "react";

export const ANALYTICS_CHART_HEIGHT = 220;
export const ANALYTICS_CHART_RESIZE_DEBOUNCE = 80;

export const ANALYTICS_CHART_MARGIN = {
  top: 8,
  right: 6,
  left: 0,
  bottom: 0,
};

export const ANALYTICS_CHART_TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgb(228 228 231)",
  backgroundColor: "rgba(255,255,255,0.98)",
  padding: "0.5rem 0.75rem",
  boxShadow: "0 10px 25px -12px rgba(15, 23, 42, 0.35)",
};

export const ANALYTICS_CHART_TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "rgb(15 23 42)",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
};

export const ANALYTICS_CHART_TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "rgb(51 65 85)",
  fontSize: 12,
};

