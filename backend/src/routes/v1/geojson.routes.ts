import { Router } from "express";

import { asyncHandler } from "@/utils/async-handler";
import { getIndiaGeoJSON } from "@/controllers/geojson.controller";

export const geojsonRoutes = Router();

geojsonRoutes.get("/india/:filename", asyncHandler(getIndiaGeoJSON));
