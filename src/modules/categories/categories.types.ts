import type { InferType } from "yup";

import type { createCategorySchema, updateCategorySchema } from "./categories.schemas";

export type CreateCategoryInput = InferType<typeof createCategorySchema>;
export type UpdateCategoryInput = InferType<typeof updateCategorySchema>;
