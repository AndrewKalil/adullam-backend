import { Router } from "express";

import { validateBody } from "~middleware";

import {
  createDiscount,
  deleteDiscount,
  getDiscountById,
  listDiscounts,
  updateDiscount,
} from "./discounts.handlers";
import { createDiscountSchema, updateDiscountSchema } from "./discounts.schemas";

export const discountsRouter = Router();

discountsRouter.get("/", listDiscounts);
discountsRouter.get("/:id", getDiscountById);
discountsRouter.post("/", validateBody(createDiscountSchema), createDiscount);
discountsRouter.patch("/:id", validateBody(updateDiscountSchema), updateDiscount);
discountsRouter.delete("/:id", deleteDiscount);
