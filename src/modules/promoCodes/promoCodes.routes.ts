import { Router } from "express";

import { validateBody } from "~middleware";

import {
  createPromoCode,
  deletePromoCode,
  getPromoCodeById,
  listPromoCodes,
  updatePromoCode,
} from "./promoCodes.handlers";
import { createPromoCodeSchema, updatePromoCodeSchema } from "./promoCodes.schemas";

export const promoCodesRouter = Router();

promoCodesRouter.get("/", listPromoCodes);
promoCodesRouter.get("/:id", getPromoCodeById);
promoCodesRouter.post("/", validateBody(createPromoCodeSchema), createPromoCode);
promoCodesRouter.patch("/:id", validateBody(updatePromoCodeSchema), updatePromoCode);
promoCodesRouter.delete("/:id", deletePromoCode);
