import type { InferType } from "yup";

import type { createDiscountSchema, updateDiscountSchema } from "./discounts.schemas";

export type CreateDiscountInput = InferType<typeof createDiscountSchema>;
export type UpdateDiscountInput = InferType<typeof updateDiscountSchema>;
