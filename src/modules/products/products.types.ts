import type { InferType } from "yup";

import type {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "./products.schemas";

export type CreateProductInput = InferType<typeof createProductSchema>;
export type UpdateProductInput = InferType<typeof updateProductSchema>;
export type ListProductsQuery = InferType<typeof listProductsSchema>;
