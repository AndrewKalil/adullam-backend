import type { InferType } from "yup";

import type { createPromoCodeSchema, updatePromoCodeSchema } from "./promoCodes.schemas";

export type CreatePromoCodeInput = InferType<typeof createPromoCodeSchema>;
export type UpdatePromoCodeInput = InferType<typeof updatePromoCodeSchema>;
