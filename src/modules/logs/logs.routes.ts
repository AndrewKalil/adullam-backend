import { Router } from "express";

import { listLogs } from "./logs.handlers";

export const logsRouter = Router();

logsRouter.get("/", listLogs);
