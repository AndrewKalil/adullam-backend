import type { InferType } from "yup";

import type { loginSchema, refreshSchema } from "./auth.schemas";

export type LoginBody = InferType<typeof loginSchema>;
export type RefreshBody = InferType<typeof refreshSchema>;
