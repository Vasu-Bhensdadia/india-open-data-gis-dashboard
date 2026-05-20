import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";

import { env } from "@/config/env";
import { HttpError } from "@/utils/http-error";

const INDIA_GEOJSON_PATH = path.resolve(env.DATASETS_DIR, "raw", "india");

function getGeoJSONFilePath(filename: string): string {
  const sanitizedFileName = path.basename(filename);
  const filePath = path.join(INDIA_GEOJSON_PATH, `${sanitizedFileName}.geojson`);

  if (!filePath.startsWith(INDIA_GEOJSON_PATH)) {
    throw new HttpError(400, "Invalid GeoJSON filename.", "INVALID_GEOJSON_PATH");
  }

  return filePath;
}

export async function getIndiaGeoJSON(request: Request, response: Response) {
  const filename = Array.isArray(request.params.filename)
    ? request.params.filename[0]
    : request.params.filename;

  if (!filename) {
    throw new HttpError(400, "GeoJSON filename is required.", "GEOJSON_FILENAME_REQUIRED");
  }

  const filePath = getGeoJSONFilePath(filename);

  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, `GeoJSON dataset not found: ${filename}`, "GEOJSON_NOT_FOUND");
  }

  response.sendFile(filePath, (error) => {
    if (error) {
      throw new HttpError(500, "Unable to stream GeoJSON dataset.", "GEOJSON_STREAM_ERROR");
    }
  });
}
