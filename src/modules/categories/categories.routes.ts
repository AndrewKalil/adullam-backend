import { Router } from "express";

import { validateBody } from "~middleware";

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "./categories.handlers";
import { createCategorySchema, updateCategorySchema } from "./categories.schemas";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategories);
categoriesRouter.get("/:id", getCategoryById);
categoriesRouter.post("/", validateBody(createCategorySchema), createCategory);
categoriesRouter.patch("/:id", validateBody(updateCategorySchema), updateCategory);
categoriesRouter.delete("/:id", deleteCategory);
