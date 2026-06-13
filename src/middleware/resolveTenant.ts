import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";

import { AppError } from "~types";
import { adminDb, tenants } from "~db";

export const resolveTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const host = req.hostname; // Express strips the port automatically

    // Try slug first: "<slug>.kalort.com" → slug = first subdomain segment
    // For local dev, Host header will be "localhost" — you can override via
    // an "x-tenant-slug" header to test different tenants without DNS.
    const xTenantSlug = req.headers["x-tenant-slug"] as string | undefined;
    const slug = xTenantSlug ?? host.split(".")[0];

    const [tenant] = await adminDb
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) {
      throw new AppError(404, "Tenant not found");
    }

    req.tenantId = tenant.id;
    next();
  } catch (err) {
    next(err);
  }
};
