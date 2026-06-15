import { array, boolean, number, object, string } from "yup";

export const createDiscountSchema = object({
  name: string().required("Name is required").max(200),
  description: string().max(2000).optional(),
  imageUrl: string().url().optional(),
  percentage: number().required("Percentage is required").min(0).max(100),
  scope: string()
    .oneOf(["products", "category"] as const)
    .required("Scope is required"),
  categoryId: string()
    .uuid()
    .nullable()
    .optional()
    .when("scope", {
      is: "category",
      then: (s) => s.required("categoryId is required when scope is category"),
    }),
  productIds: array(string().uuid().required())
    .optional()
    .when("scope", {
      is: "products",
      then: (s) =>
        s.required().min(1, "At least one productId is required when scope is products"),
    }),
  startDate: string().optional(),
  endDate: string().optional(),
  isActive: boolean().default(true),
});

export const updateDiscountSchema = object({
  name: string().min(1).max(200).optional(),
  description: string().max(2000).nullable().optional(),
  imageUrl: string().url().nullable().optional(),
  percentage: number().min(0).max(100).optional(),
  scope: string().oneOf(["products", "category"] as const).optional(),
  categoryId: string().uuid().nullable().optional(),
  productIds: array(string().uuid().required()).optional(),
  startDate: string().nullable().optional(),
  endDate: string().nullable().optional(),
  isActive: boolean().optional(),
});
