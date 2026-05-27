import { create } from "zustand";

import type { GeoJSONFeature } from "@/types/geojson";

export type MapViewLevel = "country" | "state" | "district" | "constituency";

export type MapInteractionMode = "idle" | "hover" | "select" | "zoom" | "drilldown";

export interface MapInteractionState {
  mode: MapInteractionMode;
  isDragging: boolean;
  isResettingView: boolean;
  lastInteractedFeatureId: string | null;
  viewLevel: MapViewLevel;
}

export interface MapRegionMetadata {
  featureId: string;
  regionName: string;
  regionCode?: string;
  level: MapViewLevel;
  parentRegionId?: string;
  properties: Record<string, unknown>;
}

export interface GISInteractionState {
  hoveredFeature: GeoJSONFeature<Record<string, unknown>> | null;
  selectedFeature: GeoJSONFeature<Record<string, unknown>> | null;
  activeRegionMetadata: MapRegionMetadata | null;
  mapInteraction: MapInteractionState;

  setHoveredFeature: (
    feature: GeoJSONFeature<Record<string, unknown>> | null,
    metadata?: Partial<MapRegionMetadata>,
  ) => void;
  setSelectedFeature: (
    feature: GeoJSONFeature<Record<string, unknown>> | null,
    metadata?: Partial<MapRegionMetadata>,
  ) => void;
  setActiveRegionMetadata: (metadata: MapRegionMetadata | null) => void;
  updateMapInteraction: (partial: Partial<MapInteractionState>) => void;
  resetInteractionState: () => void;
}

const defaultMapInteractionState: MapInteractionState = {
  mode: "idle",
  isDragging: false,
  isResettingView: false,
  lastInteractedFeatureId: null,
  viewLevel: "country",
};

export const useMapStore = create<GISInteractionState>()((set) => ({
  hoveredFeature: null,
  selectedFeature: null,
  activeRegionMetadata: null,
  mapInteraction: defaultMapInteractionState,

  setHoveredFeature: (feature, metadata) =>
    set((state: GISInteractionState) => ({
      hoveredFeature: feature,
      activeRegionMetadata: metadata
        ? {
            featureId:
              metadata.featureId ??
              state.activeRegionMetadata?.featureId ??
              feature?.id?.toString() ??
              "",
            regionName:
              metadata.regionName ??
              state.activeRegionMetadata?.regionName ??
              (feature?.properties?.name ? String(feature.properties.name) : "Unknown region"),
            regionCode: metadata.regionCode ?? state.activeRegionMetadata?.regionCode,
            level: metadata.level ?? state.activeRegionMetadata?.level ?? "state",
            parentRegionId: metadata.parentRegionId ?? state.activeRegionMetadata?.parentRegionId,
            properties: {
              ...(state.activeRegionMetadata?.properties ?? {}),
              ...(metadata.properties ?? {}),
            },
          }
        : state.activeRegionMetadata,
      mapInteraction: {
        ...state.mapInteraction,
        mode: feature ? "hover" : state.mapInteraction.mode,
        lastInteractedFeatureId:
          feature?.id?.toString() ?? state.mapInteraction.lastInteractedFeatureId,
      },
    })),

  setSelectedFeature: (feature, metadata) =>
    set((state: GISInteractionState) => ({
      selectedFeature: feature,
      activeRegionMetadata:
        metadata || feature
          ? {
              featureId:
                metadata?.featureId ??
                state.activeRegionMetadata?.featureId ??
                feature?.id?.toString() ??
                "",
              regionName:
                metadata?.regionName ??
                state.activeRegionMetadata?.regionName ??
                (feature?.properties?.name ? String(feature.properties.name) : "Unknown region"),
              regionCode: metadata?.regionCode ?? state.activeRegionMetadata?.regionCode,
              level: metadata?.level ?? state.activeRegionMetadata?.level ?? "state",
              parentRegionId:
                metadata?.parentRegionId ?? state.activeRegionMetadata?.parentRegionId,
              properties: {
                ...(state.activeRegionMetadata?.properties ?? {}),
                ...(metadata?.properties ?? {}),
              },
            }
          : null,
      mapInteraction: {
        ...state.mapInteraction,
        mode: feature ? "select" : state.mapInteraction.mode,
        lastInteractedFeatureId:
          feature?.id?.toString() ?? state.mapInteraction.lastInteractedFeatureId,
      },
    })),

  setActiveRegionMetadata: (metadata) =>
    set((state: GISInteractionState) => ({
      activeRegionMetadata: metadata,
      mapInteraction: {
        ...state.mapInteraction,
        lastInteractedFeatureId:
          metadata?.featureId ?? state.mapInteraction.lastInteractedFeatureId,
      },
    })),

  updateMapInteraction: (partial) =>
    set((state: GISInteractionState) => ({
      mapInteraction: {
        ...state.mapInteraction,
        ...partial,
      },
    })),

  resetInteractionState: () =>
    set(() => ({
      hoveredFeature: null,
      selectedFeature: null,
      activeRegionMetadata: null,
      mapInteraction: defaultMapInteractionState,
    })),
}));

export const selectHoveredFeature = (state: GISInteractionState) => state.hoveredFeature;
export const selectSelectedFeature = (state: GISInteractionState) => state.selectedFeature;
export const selectActiveRegionMetadata = (state: GISInteractionState) =>
  state.activeRegionMetadata;
export const selectMapInteractionState = (state: GISInteractionState) => state.mapInteraction;
export const selectIsMapDragging = (state: GISInteractionState) => state.mapInteraction.isDragging;
export const selectMapViewLevel = (state: GISInteractionState) => state.mapInteraction.viewLevel;
export const selectIsResettingView = (state: GISInteractionState) =>
  state.mapInteraction.isResettingView;
