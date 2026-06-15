import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { ValidationError } from "yup";
import type { NextFunction, Request, Response } from "express";

import { logs, withTenant } from "~db";
import { AppError } from "~types";

import { listLogsSchema } from "./logs.schemas";
import type { ListLogsQuery } from "./logs.types";

export const listLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let q: ListLogsQuery;
    try {
      q = await listLogsSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors = err.inner.length > 0 ? err.inner : [err];
        const details = errors.map((e) => ({
          field: e.path ?? "",
          message: e.message,
        }));
        throw new AppError(422, "Invalid query parameters", details);
      }
      throw err;
    }

    const result = await withTenant(req, async (tx) => {
      const userEmailSubquery = sql<string | null>`(
        SELECT email FROM users WHERE id = ${logs.userId}
      )`;

      const where = and(
        q.action ? eq(logs.action, q.action as "create" | "update" | "delete") : undefined,
        q.entity_type ? eq(logs.entityType, q.entity_type) : undefined,
        q.created_from ? gte(logs.createdAt, new Date(q.created_from)) : undefined,
        q.created_to ? lte(logs.createdAt, new Date(q.created_to)) : undefined,
      );

      const [rows, [{ count: total }]] = await Promise.all([
        tx
          .select({
            id: logs.id,
            createdAt: logs.createdAt,
            tenantId: logs.tenantId,
            userId: logs.userId,
            entityType: logs.entityType,
            entityId: logs.entityId,
            action: logs.action,
            body: logs.body,
            userEmail: userEmailSubquery,
          })
          .from(logs)
          .where(where)
          .orderBy(desc(logs.createdAt))
          .limit(q.limit)
          .offset(q.offset),
        tx.select({ count: count() }).from(logs).where(where),
      ]);

      return {
        data: rows,
        total: Number(total),
        limit: q.limit,
        offset: q.offset,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
