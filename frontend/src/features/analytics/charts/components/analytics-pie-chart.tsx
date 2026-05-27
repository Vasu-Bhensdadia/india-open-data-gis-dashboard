"use client";

import { memo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { AnalyticsPieChartModel } from "../types";
import {
  getChartModelIntegerLabel,
  getChartModelPercentageLabel,
} from "../utils/chart-transformers";
import {
  ANALYTICS_CHART_HEIGHT,
  ANALYTICS_CHART_RESIZE_DEBOUNCE,
  ANALYTICS_CHART_TOOLTIP_LABEL_STYLE,
  ANALYTICS_CHART_TOOLTIP_STYLE,
} from "../utils/chart-ui";
import { AnalyticsChartFrame } from "./analytics-chart-frame";
import { AnalyticsChartStateView } from "./analytics-chart-state";
import { AnalyticsChartTooltipCard } from "./chart-tooltip";

interface AnalyticsPieChartProps {
  chart: AnalyticsPieChartModel;
  selected?: boolean;
  onSelect?: (chartId: AnalyticsPieChartModel["id"]) => void;
}

function AnalyticsPieChartComponent({ chart, selected, onSelect }: AnalyticsPieChartProps) {
  return (
    <AnalyticsChartFrame chart={chart} selected={selected} onSelect={onSelect}>
      {chart.status !== "ready" ? (
        <AnalyticsChartStateView chart={chart} />
      ) : (
        <div style={{ height: ANALYTICS_CHART_HEIGHT }} className="relative w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={ANALYTICS_CHART_RESIZE_DEBOUNCE}>
            <PieChart>
              <Tooltip
                contentStyle={ANALYTICS_CHART_TOOLTIP_STYLE}
                labelStyle={ANALYTICS_CHART_TOOLTIP_LABEL_STYLE}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const entry = payload[0]?.payload as AnalyticsPieChartModel["data"][number];

                  return (
                    <AnalyticsChartTooltipCard
                      title={entry.label}
                      lines={[
                        { label: "Seats", value: getChartModelIntegerLabel(entry.value), swatch: entry.fill },
                        {
                          label: "Share",
                          value: getChartModelPercentageLabel(entry.percentage),
                        },
                      ]}
                      footer={chart.centerLabel}
                    />
                  );
                }}
              />
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="46%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={2}
                isAnimationActive={false}
              >
                {chart.data.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={42}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "#64748b" }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 top-[40%] flex -translate-y-1/2 justify-center text-center">
            <div className="max-w-[11rem]">
              <div className="truncate text-sm font-semibold text-zinc-950">{chart.centerLabel}</div>
              <div className="mt-0.5 text-[11px] text-zinc-500">
                {chart.data.length.toLocaleString()} categories
              </div>
            </div>
          </div>
        </div>
      )}
    </AnalyticsChartFrame>
  );
}

export const AnalyticsPieChart = memo(AnalyticsPieChartComponent);
