import type { TenantCtx } from "../db";

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      userId: string;
      claims: TenantCtx["claims"];
    }
  }
}
