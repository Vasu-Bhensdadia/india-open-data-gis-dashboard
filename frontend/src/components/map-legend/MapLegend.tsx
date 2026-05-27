import React from "react";
import type { MapLegendProps, LegendItem } from "../../lib/visualization/legendTypes";
import { gradientCss } from "../../lib/visualization/legendUtils";

const containerPositions: Record<string, React.CSSProperties> = {
  "top-left": { position: "absolute", top: 12, left: 12 },
  "top-right": { position: "absolute", top: 12, right: 12 },
  "bottom-left": { position: "absolute", bottom: 12, left: 12 },
  "bottom-right": { position: "absolute", bottom: 12, right: 12 },
  floating: { position: "relative" },
};

export function MapLegend(props: MapLegendProps) {
  const { config, position = "top-right", onItemHover, className } = props;

  return (
    <div
      aria-hidden={false}
      role="list"
      className={className}
      style={{
        minWidth: 120,
        background: "rgba(255,255,255,0.95)",
        padding: 8,
        borderRadius: 6,
        boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        fontSize: 12,
        color: "#111827",
        ...containerPositions[position],
      }}
    >
      {config.title ? <div style={{ fontWeight: 600, marginBottom: 6 }}>{config.title}</div> : null}

      {config.type === "categorical" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {config.items.map((item) => (
            <CategoricalItem key={item.label} item={item} onHover={onItemHover} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 12, borderRadius: 4, background: gradientCss(config.items) }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{config.minLabel ?? config.items[0]?.label}</div>
            <div>{config.maxLabel ?? config.items[config.items.length - 1]?.label}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {config.items.map((it) => (
              <GradientItem key={it.label} item={it} onHover={onItemHover} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoricalItem({
  item,
  onHover,
}: {
  item: LegendItem;
  onHover?: (i: LegendItem | null) => void;
}) {
  return (
    <div
      role="listitem"
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHover?.(null)}
      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
    >
      <div
        style={{
          width: 16,
          height: 12,
          background: item.color,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      />
      <div style={{ flex: 1 }}>{item.label}</div>
    </div>
  );
}

function GradientItem({
  item,
  onHover,
}: {
  item: LegendItem;
  onHover?: (i: LegendItem | null) => void;
}) {
  const label = item.label;
  return (
    <div
      role="listitem"
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHover?.(null)}
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <div style={{ width: 16, height: 12, background: item.color, borderRadius: 2 }} />
      <div style={{ flex: 1 }}>{label}</div>
    </div>
  );
}

export default MapLegend;
