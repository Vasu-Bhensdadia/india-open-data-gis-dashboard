/**
 * Utility helpers for map configuration and common GIS transformations.
 * Keep utilities small and pure so they are easy to test and replace.
 */

export function defaultTileLayerUrl(): string {
  // Using OpenStreetMap tiles as a sensible default. Tile provider can be swapped.
  return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
}

export function defaultAttribution(): string {
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
}

export function boundsFromCoordinates(coords: Array<[number, number]>): [number, number, number, number] {
  // coords are [lat, lng]
  if (!coords.length) return [0, 0, 0, 0];

  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return [minLat, minLng, maxLat, maxLng];
}
