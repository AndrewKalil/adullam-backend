import { and, count, eq, gte, ilike, isNull, lte } from "drizzle-orm";
import { ValidationError } from "yup";
import type { NextFunction, Request, Response } from "express";

import { products, withTenant } from "~db";
import { AppError } from "~types";
import { softDelete } from "~utils";

import { listProductsSchema } from "./products.schemas";
import { buildOrderBy } from "./products.utils";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.types";

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let q: ListProductsQuery;
    try {
      q = await listProductsSchema.validate(req.query, {
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
      const where = and(
        isNull(products.deletedAt),
        q.category_id ? eq(products.categoryId, q.category_id) : undefined,
        q.name ? ilike(products.name, `%${q.name}%`) : undefined,
        q.price_min ? gte(products.price, q.price_min) : undefined,
        q.price_max ? lte(products.price, q.price_max) : undefined,
        q.created_from
          ? gte(products.createdAt, new Date(q.created_from))
          : undefined,
        q.created_to
          ? lte(products.createdAt, new Date(q.created_to))
          : undefined,
      );

      const [rows, [{ count: total }]] = await Promise.all([
        tx
          .select()
          .from(products)
          .where(where)
          .orderBy(buildOrderBy(q.sort))
          .limit(q.limit)
          .offset(q.offset),
        tx.select({ count: count() }).from(products).where(where),
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

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const [row] = await withTenant(req, (tx) =>
      tx
        .select()
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1),
    );

    if (!row) throw new AppError(404, "Product not found");
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateProductInput;

    const [row] = await withTenant(req, (tx) =>
      tx
        .insert(products)
        .values({ ...body, tenantId: req.tenantId })
        .returning(),
    );

    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const { updatedAt, ...fields } = req.body as UpdateProductInput;

    await withTenant(req, async (tx) => {
      const [current] = await tx
        .select({ updatedAt: products.updatedAt })
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

      if (!current) throw new AppError(404, "Product not found");

      if (new Date(current.updatedAt) > new Date(updatedAt)) {
        throw new AppError(
          409,
          "Product was modified by another user. Please reload and try again.",
        );
      }

      const [updated] = await tx
        .update(products)
        .set(fields)
        .where(eq(products.id, id))
        .returning();

      res.json(updated);
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    await withTenant(req, async (tx) => {
      const [current] = await tx
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

      if (!current) throw new AppError(404, "Product not found");

      await tx.update(products).set(softDelete()).where(eq(products.id, id));
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
