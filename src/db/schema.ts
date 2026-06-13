import {
  boolean,
  date,
  index,
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

export const promotions = pgTable(
  "promotions",
  {
    ...baseColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type", {
      enum: ["bogo", "item-discount", "total-discount"],
    }).notNull(),
    metadata: jsonb("metadata").notNull(),
    imageUrl: text("image_url"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("idx_promotions_tenant").on(t.tenantId),
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
