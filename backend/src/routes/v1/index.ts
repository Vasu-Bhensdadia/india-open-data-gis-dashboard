import { Router } from "express";

import { healthRoutes } from "@/routes/v1/health.routes";
import { geojsonRoutes } from "@/routes/v1/geojson.routes";

export const v1Routes = Router();

v1Routes.use(healthRoutes);
v1Routes.use(geojsonRoutes);
