/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react-leaflet" {
  import type { ComponentType } from "react";

  export const MapContainer: ComponentType<any>;
  export const TileLayer: ComponentType<any>;
  export const GeoJSON: ComponentType<any>;
  export const Marker: ComponentType<any>;
  export const Popup: ComponentType<any>;
  export const useMap: () => any;
  export default {} as any;
}

declare module "leaflet" {
  export function icon(options: any): any;
  export function latLng(lat: number, lng: number): any;
  export const Icon: any;
  export default {} as any;
}
