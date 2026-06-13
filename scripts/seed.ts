import { supabaseAdmin } from "../src/integrations/supabase";
import { asAdmin } from "../src/db";
import { tenants, users, tenantMemberships } from "../src/db/schema";

const seed = async () => {
  console.log("Seeding minimal data...");

  await asAdmin(async (tx) => {
    // 1. Create tenant
    const [tenant] = await tx
      .insert(tenants)
      .values({
        name: "Demo Store",
        slug: "demo",
        timezone: "America/New_York",
        currency: "USD",
      })
      .onConflictDoNothing()
      .returning();

    if (!tenant) {
      console.log("Tenant 'demo' already exists, skipping.");
      return;
    }

    console.log("Created tenant:", tenant.id);

    // 2. Create Auth user via Supabase Admin API
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: "admin@demo.com",
        password: "password123",
        email_confirm: true,
      });

    if (authError)
      throw new Error(`Auth user creation failed: ${authError.message}`);
    const authUser = authData.user;
    console.log("Created auth user:", authUser.id);

    // 3. Mirror user in public.users
    await tx
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email!,
      })
      .onConflictDoNothing();

    // 4. Create membership
    await tx
      .insert(tenantMemberships)
      .values({
        tenantId: tenant.id,
        userId: authUser.id,
        role: "owner",
      })
      .onConflictDoNothing();

    console.log("Created membership.");
  });

  console.log("Seed complete.");
  console.log("Login: email=admin@demo.com  password=password123");
  console.log(
    "Tenant slug: demo  (use x-tenant-slug: demo header in local requests)",
  );
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
