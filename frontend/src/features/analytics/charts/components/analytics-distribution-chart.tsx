"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AnalyticsDistributionChartModel } from "../types";
import {
  getChartModelIntegerLabel,
  getChartModelPercentageLabel,
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

interface AnalyticsDistributionChartProps {
  chart: AnalyticsDistributionChartModel;
  selected?: boolean;
  onSelect?: (chartId: AnalyticsDistributionChartModel["id"]) => void;
}

function AnalyticsDistributionChartComponent({
  chart,
  selected,
  onSelect,
}: AnalyticsDistributionChartProps) {
  return (
    <AnalyticsChartFrame chart={chart} selected={selected} onSelect={onSelect}>
      {chart.status !== "ready" ? (
        <AnalyticsChartStateView chart={chart} />
      ) : (
        <div style={{ height: ANALYTICS_CHART_HEIGHT }} className="w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={ANALYTICS_CHART_RESIZE_DEBOUNCE}>
            <BarChart data={chart.data} margin={ANALYTICS_CHART_MARGIN}>
              <CartesianGrid vertical={false} stroke="#e4e4e7" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={42}
                tickMargin={10}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(value) => truncateLabel(String(value), 16)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(value) => getChartModelIntegerLabel(Number(value))}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                contentStyle={ANALYTICS_CHART_TOOLTIP_STYLE}
                labelStyle={ANALYTICS_CHART_TOOLTIP_LABEL_STYLE}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const entry = payload[0]?.payload as AnalyticsDistributionChartModel["data"][number];

                  return (
                    <AnalyticsChartTooltipCard
                      title={entry.label}
                      lines={[
                        {
                          label: "Count",
                          value: getChartModelIntegerLabel(entry.count),
                          swatch: entry.fill,
                        },
                        {
                          label: "Share",
                          value: getChartModelPercentageLabel(entry.percentage),
                        },
                      ]}
                      footer={
                        chart.xAxisLabel === "Category"
                          ? chart.binSizeLabel
                          : `${getChartModelIntegerLabel(entry.min)} to ${getChartModelIntegerLabel(entry.max)}`
                      }
                    />
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {chart.data.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsChartFrame>
  );
}

export const AnalyticsDistributionChart = memo(AnalyticsDistributionChartComponent);
