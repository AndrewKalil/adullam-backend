import type { Request } from "express";
import type { TenantCtx } from "~db";

export const buildCtx = (req: Request): TenantCtx => ({
  tenantId: req.tenantId,
  claims: req.claims,
});
