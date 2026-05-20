export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function calculateBoundingBox(coordinates: number[][]): BoundingBox {
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

export function normalizeCoordinatePrecision(coordinates: number[][], precision = 6): number[][] {
  const factor = 10 ** precision;
  return coordinates.map(([x, y]) => [Math.round(x * factor) / factor, Math.round(y * factor) / factor]);
}

export function validateFeatureGeometry(geometry: unknown): boolean {
  return geometry !== null && typeof geometry === "object";
}
