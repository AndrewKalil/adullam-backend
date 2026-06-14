import { boolean, number, object, string } from "yup";

export const createPromoCodeSchema = object({
  code: string().required("Code is required").max(50).uppercase(),
  discountType: string()
    .oneOf(["percentage", "fixed"] as const)
    .required("discountType is required"),
  discountValue: number().required("discountValue is required").positive(),
  minOrderAmount: number().positive().nullable().optional(),
  maxUses: number().integer().positive().nullable().optional(),
  expiresAt: string().optional(),
  isActive: boolean().default(true),
});

export const updatePromoCodeSchema = object({
  code: string().min(1).max(50).uppercase().optional(),
  discountType: string().oneOf(["percentage", "fixed"] as const).optional(),
  discountValue: number().positive().optional(),
  minOrderAmount: number().positive().nullable().optional(),
  maxUses: number().integer().positive().nullable().optional(),
  expiresAt: string().nullable().optional(),
  isActive: boolean().optional(),
});
