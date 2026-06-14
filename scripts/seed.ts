import { supabaseAdmin } from "../src/integrations/supabase";
import { asAdmin } from "../src/db";
import {
  categories,
  discounts,
  products,
  tenantMemberships,
  tenants,
  users,
} from "../src/db/schema";

interface SeedTenant {
  name: string;
  slug: string;
  timezone: string;
  currency: string;
}

interface SeedUser {
  email: string;
  password: string;
}

interface SeedData {
  tenant: SeedTenant;
  owner: SeedUser;
}

const SEED_DATA: SeedData[] = [
  {
    tenant: {
      name: "Demo Store",
      slug: "demo",
      timezone: "America/New_York",
      currency: "USD",
    },
    owner: { email: "admin@demo.com", password: "password123" },
  },
  {
    tenant: {
      name: "Letty's Paradise",
      slug: "lettys",
      timezone: "America/Chicago",
      currency: "USD",
    },
    owner: { email: "letty@paradise.com", password: "password123" },
  },
];

const createAuthUser = async (email: string, password: string) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === email);
      if (existing) return existing;
    }
    throw new Error(`Auth error for ${email}: ${error.message}`);
  }

  return data.user;
};

const seed = async () => {
  console.log("Seeding database...\n");

  const { error: bucketError } = await supabaseAdmin.storage.createBucket(
    "adullam-media",
    { public: true },
  );
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.warn("Bucket warning:", bucketError.message);
  } else {
    console.log("Storage bucket ready.");
  }

  for (const { tenant: tenantData, owner } of SEED_DATA) {
    console.log(`\n--- Seeding tenant: ${tenantData.slug} ---`);

    await asAdmin(async (tx) => {
      const [tenant] = await tx
        .insert(tenants)
        .values(tenantData)
        .onConflictDoNothing()
        .returning();

      if (!tenant) {
        console.log(`Tenant '${tenantData.slug}' already exists, skipping.`);
        return;
      }
      console.log(`Created tenant: ${tenant.id}`);

      const authUser = await createAuthUser(owner.email, owner.password);
      console.log(`Auth user: ${authUser.id} (${owner.email})`);

      await tx
        .insert(users)
        .values({ id: authUser.id, email: authUser.email! })
        .onConflictDoNothing();

      await tx
        .insert(tenantMemberships)
        .values({ tenantId: tenant.id, userId: authUser.id, role: "owner" })
        .onConflictDoNothing();

      const [catDrinks, catFood, catSnacks] = await tx
        .insert(categories)
        .values([
          { tenantId: tenant.id, name: "Drinks", color: "#3B82F6" },
          { tenantId: tenant.id, name: "Food", color: "#10B981" },
          { tenantId: tenant.id, name: "Snacks", color: "#F59E0B" },
        ])
        .onConflictDoNothing()
        .returning();

      console.log("Created 3 categories.");

      await tx
        .insert(products)
        .values([
          {
            tenantId: tenant.id,
            categoryId: catDrinks?.id,
            name: "Orange Juice",
            price: "3.50",
            isAvailable: true,
          },
          {
            tenantId: tenant.id,
            categoryId: catDrinks?.id,
            name: "Sparkling Water",
            price: "2.00",
            isAvailable: true,
          },
          {
            tenantId: tenant.id,
            categoryId: catFood?.id,
            name: "Burger",
            price: "12.99",
            isAvailable: true,
          },
          {
            tenantId: tenant.id,
            categoryId: catFood?.id,
            name: "Caesar Salad",
            price: "10.50",
            isAvailable: true,
          },
          {
            tenantId: tenant.id,
            categoryId: catSnacks?.id,
            name: "Mixed Nuts",
            price: "5.00",
            isAvailable: true,
          },
          {
            tenantId: tenant.id,
            categoryId: catSnacks?.id,
            name: "Chips",
            price: "2.50",
            isAvailable: false,
          },
        ])
        .onConflictDoNothing();

      console.log("Created 6 products.");

      await tx
        .insert(discounts)
        .values([
          {
            tenantId: tenant.id,
            name: "Drinks Happy Hour",
            percentage: "20.00",
            scope: "category",
            categoryId: catDrinks?.id,
            isActive: true,
          },
          {
            tenantId: tenant.id,
            name: "Snacks Weekend Deal",
            percentage: "15.00",
            scope: "category",
            categoryId: catSnacks?.id,
            startDate: new Date("2026-06-01"),
            endDate: new Date("2026-08-31"),
            isActive: true,
          },
        ])
        .onConflictDoNothing();

      console.log("Created 2 discounts.");
    });
  }

  console.log("\n=== Seed complete ===");
  console.log("Tenants:");
  for (const { tenant, owner } of SEED_DATA) {
    console.log(`  ${tenant.slug}: ${owner.email} / password123`);
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
