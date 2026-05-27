"use client";

import type { ReactNode } from "react";

export interface MapTooltipField {
  label: string;
  value: string;
}

export interface MapTooltipProps {
  regionName: string;
  regionCode?: string;
  fields: MapTooltipField[];
  analyticsHint?: string;
  className?: string;
  children?: ReactNode;
}

export function MapTooltip({
  regionName,
  regionCode,
  fields,
  analyticsHint = "Analytics fields will be available here in a future release.",
  className,
  children,
}: MapTooltipProps) {
  return (
    <div className={`geojson-map-tooltip-card ${className ?? ""}`}>
      <div className="tooltip-header">
        <div className="tooltip-title">{regionName}</div>
        {regionCode ? <div className="tooltip-subtitle">Code: {regionCode}</div> : null}
      </div>

      <div className="tooltip-details">
        {fields.map((field) => (
          <div key={field.label} className="tooltip-row">
            <span className="tooltip-label">{field.label}</span>
            <span className="tooltip-value">{field.value}</span>
          </div>
        ))}
      </div>

      <div className="tooltip-analytics">{analyticsHint}</div>
      {children}
    </div>
  );
}
