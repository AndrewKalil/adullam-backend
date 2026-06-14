import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { baseColumns } from "./columns";

// users.id mirrors the Supabase Auth user id (the JWT sub).
// No defaultRandom() here — the id comes from Auth, not from us.
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  email: text("email").notNull().unique(),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
});

export const tenants = pgTable("tenants", {
  ...baseColumns,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  customDomain: text("custom_domain").unique(),
  establishedDate: date("established_date"),
  description: text("description"),
  timezone: text("timezone").notNull().default("UTC"),
  currency: text("currency").notNull().default("USD"),
  slogan: text("slogan"),
});

export const tenantMemberships = pgTable(
  "tenant_memberships",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role", { enum: ["owner", "editor"] }).notNull(),
  },
  (t) => [
    uniqueIndex("uniq_tenant_user")
      .on(t.tenantId, t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_memberships_tenant").on(t.tenantId),
    index("idx_memberships_user").on(t.userId),
  ],
);

export const categories = pgTable(
  "categories",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
  },
  (t) => [
    uniqueIndex("uniq_category_name_per_tenant")
      .on(t.tenantId, t.name)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_categories_tenant").on(t.tenantId),
  ],
);

export const products = pgTable(
  "products",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    categoryId: uuid("category_id").references(() => categories.id),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
  },
  (t) => [
    index("idx_products_tenant").on(t.tenantId),
    index("idx_products_category").on(t.categoryId),
  ],
);

export const discounts = pgTable(
  "discounts",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
    scope: text("scope", { enum: ["products", "category"] }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("idx_discounts_tenant").on(t.tenantId),
    index("idx_discounts_category").on(t.categoryId),
  ],
);

export const discountProducts = pgTable(
  "discount_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    discountId: uuid("discount_id")
      .notNull()
      .references(() => discounts.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
  },
  (t) => [
    index("idx_discount_products_discount").on(t.discountId),
    index("idx_discount_products_product").on(t.productId),
    uniqueIndex("uniq_discount_product").on(t.discountId, t.productId),
  ],
);

export const promoCodes = pgTable(
  "promo_codes",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    code: text("code").notNull(),
    discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
    discountValue: numeric("discount_value", { precision: 12, scale: 2 }).notNull(),
    minOrderAmount: numeric("min_order_amount", { precision: 12, scale: 2 }),
    maxUses: integer("max_uses"),
    useCount: integer("use_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("idx_promo_codes_tenant").on(t.tenantId),
    uniqueIndex("uniq_code_per_tenant")
      .on(t.tenantId, t.code)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// Append-only audit table. No soft delete, no updated_at. Written by trigger, never by handlers.
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  tenantId: uuid("tenant_id"),
  userId: uuid("user_id"),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action", { enum: ["create", "update", "delete"] }).notNull(),
  body: jsonb("body"),
});
