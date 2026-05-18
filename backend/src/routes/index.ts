import { Router } from "express";

import { env } from "@/config/env";
import { v1Routes } from "@/routes/v1";

export const apiRoutes = Router();

apiRoutes.use(`/${env.API_VERSION}`, v1Routes);
