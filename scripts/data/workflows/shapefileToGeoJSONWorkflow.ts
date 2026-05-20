import path from "node:path";
import { prepareShapefileSource, convertShapefileToGeoJSON, validateGeoJSON } from "../ingest/shapefileToGeoJSON";
import { extractMetadataFromGeoJSON } from "../utils/metadataUtils";

export interface WorkflowContext {
  rawDirectory: string;
  outputGeoJSONPath: string;
}

export function runShapefileToGeoJSONWorkflow(context: WorkflowContext) {
  const source = prepareShapefileSource(context.rawDirectory);
  const output = convertShapefileToGeoJSON(source, context.outputGeoJSONPath);
  const isValid = validateGeoJSON(output);

  const metadata = extractMetadataFromGeoJSON({
    type: "FeatureCollection",
    features: output.features,
  });

  return {
    success: isValid,
    outputPath: path.resolve(context.outputGeoJSONPath),
    metadata,
  };
}
