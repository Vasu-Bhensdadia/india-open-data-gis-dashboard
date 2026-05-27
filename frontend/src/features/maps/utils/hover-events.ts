import type { GeoJSONFeature } from "@/types/geojson";
import type { GeoJSONPathOptions } from "./hover-style";
import {
  GEOJSON_HOVERABLE_CLASS_NAME,
  defaultGeoJSONFeatureStyle,
  hoverGeoJSONFeatureStyle,
  mergeGeoJSONFeatureStyles,
} from "./hover-style";
import { createGeoJSONFeatureSelectionStyle } from "./selection-style";
import type { GeoJSONStyleSource } from "./style-utils";
import { getGeoJSONStyleForFeature } from "./style-utils";

interface HoverableLeafletLayer {
  _geojsonInteractionBound?: boolean;
  _geojsonSelected?: boolean;
  setStyle?: (style: GeoJSONPathOptions) => void;
  bindTooltip?: (content: string, options?: Record<string, unknown>) => unknown;
  bringToFront?: () => void;
  on: (events: Record<string, () => void>) => unknown;
}

export interface MapFeatureHoverActions<TProperties = Record<string, unknown>> {
  baseStyle?: GeoJSONStyleSource<TProperties>;
  hoverStyle?: GeoJSONStyleSource<TProperties>;
  selectedStyle?: GeoJSONStyleSource<TProperties>;
  onHoverFeature?: (feature: GeoJSONFeature<TProperties>) => void;
  onLeaveFeature?: (feature: GeoJSONFeature<TProperties>) => void;
}

export interface MapFeatureInteractionActions<
  TProperties = Record<string, unknown>,
> extends MapFeatureHoverActions<TProperties> {
  onFeatureClick?: (feature: GeoJSONFeature<TProperties>, layer: unknown) => void;
}

export function createGeoJSONFeatureStyle(baseStyle: GeoJSONPathOptions): GeoJSONPathOptions {
  return {
    ...baseStyle,
    className: GEOJSON_HOVERABLE_CLASS_NAME,
  };
}

export function bindGeoJSONFeatureHover<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
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
    mergeGeoJSONFeatureStyles(
      defaultGeoJSONFeatureStyle,
      getGeoJSONStyleForFeature(actions.baseStyle, feature),
    ),
  );
  const hoverStyle = createGeoJSONFeatureStyle(
    mergeGeoJSONFeatureStyles(
      mergeGeoJSONFeatureStyles(baseStyle, hoverGeoJSONFeatureStyle),
      getGeoJSONStyleForFeature(actions.hoverStyle, feature),
    ),
  );

  const selectedStyle = createGeoJSONFeatureStyle(
    mergeGeoJSONFeatureStyles(baseStyle, getGeoJSONStyleForFeature(actions.selectedStyle, feature)),
  );
  const selectedRestoreStyle = createGeoJSONFeatureSelectionStyle(selectedStyle);

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
        if (hoverableLayer._geojsonSelected) {
          hoverableLayer.setStyle(selectedStyle);
        } else {
          hoverableLayer.setStyle(hoverStyle);
        }
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

export function bindGeoJSONFeatureInteractions<
  TProperties extends Record<string, unknown> = Record<string, unknown>,
>(
  layer: unknown,
  feature: GeoJSONFeature<TProperties>,
  actions: MapFeatureInteractionActions<TProperties>,
) {
  bindGeoJSONFeatureHover(layer, feature, actions);
}
