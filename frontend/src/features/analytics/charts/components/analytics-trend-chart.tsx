"use client";

import { memo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AnalyticsTrendChartModel } from "../types";
import {
  getChartModelIntegerLabel,
  getChartModelValueLabel,
  truncateLabel,
} from "../utils/chart-transformers";
import {
  ANALYTICS_CHART_HEIGHT,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_CHART_RESIZE_DEBOUNCE,
  ANALYTICS_CHART_TOOLTIP_LABEL_STYLE,
  ANALYTICS_CHART_TOOLTIP_STYLE,
} from "../utils/chart-ui";
import { AnalyticsChartFrame } from "./analytics-chart-frame";
import { AnalyticsChartStateView } from "./analytics-chart-state";
import { AnalyticsChartTooltipCard } from "./chart-tooltip";

interface AnalyticsTrendChartProps {
  chart: AnalyticsTrendChartModel;
  selected?: boolean;
  onSelect?: (chartId: AnalyticsTrendChartModel["id"]) => void;
}

function AnalyticsTrendChartComponent({ chart, selected, onSelect }: AnalyticsTrendChartProps) {
  return (
    <AnalyticsChartFrame chart={chart} selected={selected} onSelect={onSelect}>
      {chart.status !== "ready" ? (
        <AnalyticsChartStateView chart={chart} />
      ) : (
        <div style={{ height: ANALYTICS_CHART_HEIGHT }} className="w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={ANALYTICS_CHART_RESIZE_DEBOUNCE}>
            <LineChart data={chart.data} margin={ANALYTICS_CHART_MARGIN}>
              <CartesianGrid vertical={false} stroke="#e4e4e7" strokeDasharray="3 3" />
              <XAxis
                dataKey="sequence"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={36}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(value) => getChartModelValueLabel(Number(value))}
              />
              <Tooltip
                contentStyle={ANALYTICS_CHART_TOOLTIP_STYLE}
                labelStyle={ANALYTICS_CHART_TOOLTIP_LABEL_STYLE}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const entry = payload[0]?.payload as AnalyticsTrendChartModel["data"][number];

                  return (
                    <AnalyticsChartTooltipCard
                      title={truncateLabel(entry.label, 34)}
                      lines={[
                        { label: "Rank", value: `#${getChartModelIntegerLabel(entry.sequence)}` },
                        {
                          label: chart.yAxisLabel,
                          value: getChartModelValueLabel(entry.value),
                          swatch: entry.fill,
                        },
                      ]}
                      footer={chart.title}
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsChartFrame>
  );
}

export const AnalyticsTrendChart = memo(AnalyticsTrendChartComponent);

