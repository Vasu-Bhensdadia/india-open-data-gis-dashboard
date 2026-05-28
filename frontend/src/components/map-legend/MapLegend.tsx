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
  const isFloating = position === "floating";

  return (
    <div
      aria-hidden={false}
      role="list"
      className={className}
      style={{
        minWidth: 0,
        maxWidth: "min(18rem, calc(100vw - 2rem))",
        maxHeight: "42vh",
        overflowY: "auto",
        background: "rgba(255,255,255,0.96)",
        padding: 10,
        borderRadius: 8,
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: isFloating ? "0 12px 32px rgba(15,23,42,0.12)" : "0 6px 18px rgba(15,23,42,0.08)",
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        fontSize: 12,
        color: "#111827",
        ...containerPositions[position],
      }}
    >
      {config.title ? (
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>{config.title}</div>
      ) : null}

      {config.type === "categorical" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {config.items.map((item) => (
            <CategoricalItem key={item.label} item={item} onHover={onItemHover} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 12, borderRadius: 999, background: gradientCss(config.items) }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "4px 6px",
        borderRadius: 6,
      }}
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
      <div style={{ flex: 1, lineHeight: 1.2 }}>{item.label}</div>
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
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 6 }}
    >
      <div style={{ width: 16, height: 12, background: item.color, borderRadius: 2 }} />
      <div style={{ flex: 1, lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

export default MapLegend;
