export const DISCOUNTS_TABLE = "discounts";
export const DISCOUNT_PRODUCTS_TABLE = "discount_products";

export const DISCOUNT_SCOPES = ["products", "category"] as const;
export type DiscountScope = (typeof DISCOUNT_SCOPES)[number];
