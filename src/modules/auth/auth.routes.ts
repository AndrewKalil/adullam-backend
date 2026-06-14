import { Router } from "express";

import { authenticate, validateBody } from "~middleware";

import { login, logout, refresh } from "./auth.handlers";
import { loginSchema, refreshSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/refresh", validateBody(refreshSchema), refresh);
authRouter.post("/logout", authenticate, logout);
