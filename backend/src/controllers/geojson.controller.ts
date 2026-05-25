import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

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

export async function getIndiaGeoJSON(request: Request, response: Response, next: NextFunction) {
  const filename = Array.isArray(request.params.filename)
    ? request.params.filename[0]
    : request.params.filename;

  if (!filename) {
    next(new HttpError(400, "GeoJSON filename is required.", "GEOJSON_FILENAME_REQUIRED"));
    return;
  }

  const filePath = getGeoJSONFilePath(filename);

  if (!fs.existsSync(filePath)) {
    next(new HttpError(404, `GeoJSON dataset not found: ${filename}`, "GEOJSON_NOT_FOUND"));
    return;
  }

  response.sendFile(filePath, (error) => {
    if (error) {
      const message = error instanceof Error ? error.message : "Unable to stream GeoJSON dataset.";
      next(new HttpError(500, `Unable to stream GeoJSON dataset: ${message}`, "GEOJSON_STREAM_ERROR"));
    }
  });
}
