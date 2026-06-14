export const PRODUCTS_TABLE = "products";

export const VALID_SORT_VALUES = [
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
  "created_asc",
  "created_desc",
];

export type ProductSortValue = (typeof VALID_SORT_VALUES)[number];
