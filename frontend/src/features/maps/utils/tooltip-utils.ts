export interface MapTooltipDatum {
  label: string;
  value: string;
}

export interface MapTooltipModel {
  regionName: string;
  regionCode?: string;
  analyticsPlaceholder: string;
  fields: MapTooltipDatum[];
}

const REGION_NAME_KEYS = [
  "region_name",
  "state_name",
  "district_name",
  "name",
  "constituency_name",
];

const REGION_CODE_KEYS = [
  "region_code",
  "state_code",
  "district_code",
  "code",
  "constituency_code",
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function safeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  if (typeof value === "string") {
    return value.trim() || "Unknown";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export function extractGeoJSONTooltipProperties<
  TProperties extends Record<string, unknown> = Record<string, unknown>
>(properties: TProperties): MapTooltipModel {
  const regionName = REGION_NAME_KEYS.reduce<string | undefined>((found, key) => {
    if (found) return found;
    const value = properties[key as keyof TProperties];
    return value != null && String(value).trim() ? String(value) : undefined;
  }, undefined) ?? "Unknown region";

  const regionCode = REGION_CODE_KEYS.reduce<string | undefined>((found, key) => {
    if (found) return found;
    const value = properties[key as keyof TProperties];
    return value != null && String(value).trim() ? String(value) : undefined;
  }, undefined);

  const details = Object.keys(properties)
    .filter((key) =>
      !REGION_NAME_KEYS.includes(key) && !REGION_CODE_KEYS.includes(key),
    )
    .slice(0, 4)
    .map((key) => ({
      label: normalizeLabel(key),
      value: safeValue(properties[key as keyof TProperties]),
    }));

  if (details.length === 0) {
    details.push({
      label: "Details",
      value: "No additional metadata available",
    });
  }

  return {
    regionName,
    regionCode,
    analyticsPlaceholder: "Analytics fields will be available here in a future release.",
    fields: details,
  };
}

export function formatGeoJSONTooltipHtml(model: MapTooltipModel): string {
  const codeLine = model.regionCode
    ? `<div class="tooltip-row tooltip-row-code"><span class="tooltip-label">Code</span><span class="tooltip-value">${escapeHtml(model.regionCode)}</span></div>`
    : "";

  const detailRows = model.fields
    .map(
      (field) =>
        `<div class="tooltip-row"><span class="tooltip-label">${escapeHtml(field.label)}</span><span class="tooltip-value">${escapeHtml(field.value)}</span></div>`,
    )
    .join("");

  return `
    <div class="geojson-map-tooltip-content">
      <div class="tooltip-header">
        <div class="tooltip-title">${escapeHtml(model.regionName)}</div>
        ${codeLine}
      </div>
      <div class="tooltip-details">${detailRows}</div>
      <div class="tooltip-analytics">${escapeHtml(model.analyticsPlaceholder)}</div>
    </div>
  `;
}
