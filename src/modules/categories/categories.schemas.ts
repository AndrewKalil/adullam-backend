import { object, string } from "yup";

export const createCategorySchema = object({
  name: string().required("Name is required").max(100),
  description: string().max(500).optional(),
  color: string().matches(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").optional(),
});

export const updateCategorySchema = object({
  name: string().min(1).max(100).optional(),
  description: string().max(500).optional(),
  color: string().matches(/^#[0-9a-fA-F]{6}$/).optional(),
});
