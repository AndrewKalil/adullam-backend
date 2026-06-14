import { Router } from "express";

import { validateBody } from "~middleware";

import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./products.handlers";
import { createProductSchema, updateProductSchema } from "./products.schemas";

export const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:id", getProductById);
productsRouter.post("/", validateBody(createProductSchema), createProduct);
productsRouter.patch("/:id", validateBody(updateProductSchema), updateProduct);
productsRouter.delete("/:id", deleteProduct);
