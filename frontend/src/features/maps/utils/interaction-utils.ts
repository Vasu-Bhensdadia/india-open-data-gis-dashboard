import type { GeoJSONFeature } from "@/types/geojson";

interface LeafletClickableLayer {
  on?: (events: Record<string, () => void>) => void;
}

export interface MapFeatureInteractionActions<TProperties = Record<string, unknown>> {
  onFeatureClick?: (feature: GeoJSONFeature<TProperties>, layer: unknown) => void;
}

export function bindGeoJSONFeatureClick<TProperties = Record<string, unknown>>(
  layer: unknown,
  feature: GeoJSONFeature<TProperties>,
  actions: MapFeatureInteractionActions<TProperties>,
) {
  const clickLayer = layer as LeafletClickableLayer;

  if (!clickLayer || typeof clickLayer.on !== "function") {
    return;
  }

  clickLayer.on({
    click: () => {
      actions.onFeatureClick?.(feature, layer);
    },
  });
}
