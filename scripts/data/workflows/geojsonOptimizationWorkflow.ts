import { optimizeGeoJSONProperties, mergeGeoJSONFragments } from "../optimization/optimizeGeoJSON";
import { simplifyGeoJSONCollection } from "../optimization/simplifyGeometry";

export interface OptimizationContext {
  collections: Array<{ type: string; features: unknown[] }>;
  simplifyTolerance?: number;
}

export function runGeoJSONOptimizationWorkflow(context: OptimizationContext) {
  const merged = mergeGeoJSONFragments(context.collections as any);
  const optimized = optimizeGeoJSONProperties(merged as any);
  const simplified = simplifyGeoJSONCollection(optimized as any, context.simplifyTolerance ?? 0.001);

  return {
    success: true,
    optimized,
    simplified,
  };
}
