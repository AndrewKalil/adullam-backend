import { boolean, number, object, string } from "yup";

import { VALID_SORT_VALUES } from "./products.constants";

export const createProductSchema = object({
  name: string().required("Name is required").max(200),
  description: string().max(2000).optional(),
  categoryId: string().uuid().optional(),
  price: string()
    .required()
    .matches(
      /^\d+(\.\d{1,2})?$/,
      "Price must be a valid decimal with up to 2 decimal places",
    ),
  imageUrl: string().url().optional(),
  isAvailable: boolean().default(true),
});

export const updateProductSchema = object({
  name: string().min(1).max(200).optional(),
  description: string().max(2000).optional(),
  categoryId: string().uuid().nullable().optional(),
  price: string()
    .matches(/^\d+(\.\d{1,2})?$/)
    .optional(),
  imageUrl: string().url().nullable().optional(),
  isAvailable: boolean().optional(),
  updatedAt: string().required("updatedAt must be an ISO datetime string"),
});

export const listProductsSchema = object({
  category_id: string().uuid().optional(),
  name: string().optional(),
  price_min: string()
    .matches(/^\d+(\.\d{1,2})?$/)
    .optional(),
  price_max: string()
    .matches(/^\d+(\.\d{1,2})?$/)
    .optional(),
  created_from: string().optional(),
  created_to: string().optional(),
  sort: string().oneOf([...VALID_SORT_VALUES]).default("created_desc"),
  limit: number().integer().min(1).max(100).default(20),
  offset: number().integer().min(0).default(0),
});
