export const PROMO_CODES_TABLE = "promo_codes";

export const PROMO_DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type PromoDiscountType = (typeof PROMO_DISCOUNT_TYPES)[number];
