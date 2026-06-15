export const LOGS_TABLE = "logs";

export const VALID_LOG_ACTION_VALUES = ["create", "update", "delete"] as const;

export const VALID_ENTITY_TYPE_VALUES = [
  "categories",
  "products",
  "discounts",
  "discount_products",
  "promo_codes",
] as const;
