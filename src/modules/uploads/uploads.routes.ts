import { Router } from "express";

import { createSignedUpload } from "./uploads.handlers";

export const uploadsRouter = Router();

uploadsRouter.post("/sign", createSignedUpload);
