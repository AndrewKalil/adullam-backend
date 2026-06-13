import { sql } from "drizzle-orm";

import { adminDb, db } from "../../client";
import type { TenantCtx, TxClient } from "./withTenant.types";

/**
 * The only door to the database for request handlers.
 *
 * Opens a transaction, sets the three Postgres session variables the RLS
 * policies need, then calls fn with the transaction handle.
 *
 * set_config(key, value, true) is the parameterized form of SET LOCAL.
 * The "true" argument makes the setting transaction-local — it disappears
 * when the transaction ends, so one request cannot bleed into another.
 */
export const withTenant = async <T>(
  ctx: TenantCtx,
  fn: (tx: TxClient) => Promise<T>,
): Promise<T> => {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('role', 'authenticated', true)`);
    await tx.execute(
      sql`select set_config('request.jwt.claims', ${JSON.stringify(ctx.claims)}, true)`,
    );
    await tx.execute(
      sql`select set_config('app.current_tenant', ${ctx.tenantId}, true)`,
    );
    return fn(tx);
  });
};

/**
 * Service-role path. RLS is bypassed.
 * Use only for migrations, seed scripts, and explicit platform-admin operations.
 */
export const asAdmin = async <T>(
  fn: (tx: TxClient) => Promise<T>,
): Promise<T> => {
  return adminDb.transaction(fn);
};
