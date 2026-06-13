import type { NextFunction, Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { adminDb } from "../db";
import { tenantMemberships } from "../db/schema";
import { AppError } from "../types";

export const verifyMembership = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [membership] = await adminDb
      .select({ id: tenantMemberships.id })
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, req.tenantId),
          eq(tenantMemberships.userId, req.userId),
          isNull(tenantMemberships.deletedAt),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new AppError(403, "You are not a member of this tenant");
    }

    next();
  } catch (err) {
    next(err);
  }
};
