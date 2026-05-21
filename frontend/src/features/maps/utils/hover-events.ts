import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "./hover-style";
import {
  GEOJSON_HOVERABLE_CLASS_NAME,
  defaultGeoJSONFeatureStyle,
  hoverGeoJSONFeatureStyle,
  mergeGeoJSONFeatureStyles,
} from "./hover-style";
import { createGeoJSONFeatureSelectionStyle } from "./selection-style";

interface HoverableLeafletLayer {
  _geojsonInteractionBound?: boolean;
  _geojsonSelected?: boolean;
  setStyle?: (style: GeoJSONPathOptions) => void;
  bindTooltip?: (content: string, options?: Record<string, unknown>) => unknown;
  on: (events: Record<string, () => void>) => unknown;
}

export interface MapFeatureHoverActions<TProperties = Record<string, unknown>> {
  baseStyle?: GeoJSONPathOptions;
  hoverStyle?: GeoJSONPathOptions;
  selectedStyle?: GeoJSONPathOptions;
  onHoverFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onLeaveFeature?: (feature: GeoJSONFeature<TProperties>) => void;
}

export interface MapFeatureInteractionActions<TProperties = Record<string, unknown>>
  extends MapFeatureHoverActions<TProperties> {
  onFeatureClick?: (feature: GeoJSONFeature<TProperties>, layer: unknown) => void;
}

export function createGeoJSONFeatureStyle(
  baseStyle: GeoJSONPathOptions,
): GeoJSONPathOptions {
  return {
    ...baseStyle,
    className: GEOJSON_HOVERABLE_CLASS_NAME,
  };
}

export function bindGeoJSONFeatureHover<TProperties = Record<string, unknown>>(
  layer: unknown,
  feature: GeoJSONFeature<TProperties>,
  actions: MapFeatureInteractionActions<TProperties>,
) {
  const hoverableLayer = layer as HoverableLeafletLayer;

  if (!layer || typeof hoverableLayer.on !== "function") {
    return;
  }

  if (hoverableLayer._geojsonInteractionBound) {
    return;
  }

  hoverableLayer._geojsonInteractionBound = true;

  const baseStyle = createGeoJSONFeatureStyle(
    mergeGeoJSONFeatureStyles(defaultGeoJSONFeatureStyle, actions.baseStyle ?? {}),
  );
  const hoverStyle = createGeoJSONFeatureStyle(
    mergeGeoJSONFeatureStyles(
      mergeGeoJSONFeatureStyles(baseStyle, hoverGeoJSONFeatureStyle),
      actions.hoverStyle ?? {},
    ),
  );

  const selectedStyle = createGeoJSONFeatureStyle(
    mergeGeoJSONFeatureStyles(baseStyle, actions.selectedStyle ?? {}),
  );
  const selectedRestoreStyle = createGeoJSONFeatureSelectionStyle(
    selectedStyle,
  );

  const restoreLayerStyle = () => {
    if (typeof hoverableLayer.setStyle !== "function") {
      return;
    }

    if (hoverableLayer._geojsonSelected) {
      hoverableLayer.setStyle(selectedRestoreStyle);
      return;
    }

    hoverableLayer.setStyle(baseStyle);
  };

  hoverableLayer.on({
    mouseover: () => {
      if (typeof hoverableLayer.setStyle === "function") {
        hoverableLayer.setStyle(hoverStyle);
      }

      actions.onHoverFeature?.(feature);
    },
    mouseout: () => {
      restoreLayerStyle();
      actions.onLeaveFeature?.(feature);
    },
    click: () => {
      actions.onFeatureClick?.(feature, layer);
    },
  });
}

export function bindGeoJSONFeatureInteractions<TProperties = Record<string, unknown>>(
  layer: unknown,
  feature: GeoJSONFeature<TProperties>,
  actions: MapFeatureInteractionActions<TProperties>,
) {
  bindGeoJSONFeatureHover(layer, feature, actions);
}
