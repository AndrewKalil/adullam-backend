import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~config";

import * as schema from "./schema";

// Regular client — connects as the anon/authenticated role.
// Every query must go through withTenant so RLS applies.
const pgClient = postgres(env.databaseUrl);
export const db = drizzle(pgClient, { schema });

// Service-role client — bypasses RLS.
// Only for migrations, seed scripts, and explicit platform-admin paths.
const adminPgClient = postgres(env.databaseUrl, {
  // The service role key is used in the connection string for Supabase.
  // For local dev the same DATABASE_URL works since we set the role below.
});
export const adminDb = drizzle(adminPgClient, { schema });
