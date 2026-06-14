import { and, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

import { discountProducts, discounts, withTenant } from "~db";
import { AppError } from "~types";
import { softDelete } from "~utils";

import type { CreateDiscountInput, UpdateDiscountInput } from "./discounts.types";

export const listDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rows = await withTenant(req, (tx) =>
      tx
        .select()
        .from(discounts)
        .where(isNull(discounts.deletedAt))
        .orderBy(discounts.name),
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getDiscountById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    const result = await withTenant(req, async (tx) => {
      const [row] = await tx
        .select()
        .from(discounts)
        .where(and(eq(discounts.id, id), isNull(discounts.deletedAt)))
        .limit(1);

      if (!row) return null;

      if (row.scope === "products") {
        const links = await tx
          .select({ productId: discountProducts.productId })
          .from(discountProducts)
          .where(eq(discountProducts.discountId, id));
        return { ...row, productIds: links.map((l) => l.productId) };
      }

      return { ...row, productIds: [] };
    });

    if (!result) throw new AppError(404, "Discount not found");
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productIds, startDate, endDate, percentage, ...rest } =
      req.body as CreateDiscountInput;

    const result = await withTenant(req, async (tx) => {
      const [row] = await tx
        .insert(discounts)
        .values({
          ...rest,
          tenantId: req.tenantId,
          percentage: String(percentage),
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        })
        .returning();

      if (rest.scope === "products" && productIds && productIds.length > 0) {
        await tx.insert(discountProducts).values(
          productIds.map((productId) => ({
            discountId: row.id,
            productId,
            tenantId: req.tenantId,
          })),
        );
      }

      return { ...row, productIds: productIds ?? [] };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const { productIds, startDate, endDate, percentage, ...rest } =
      req.body as UpdateDiscountInput;

    const payload = {
      ...rest,
      ...(percentage !== undefined && { percentage: String(percentage) }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    };

    const result = await withTenant(req, async (tx) => {
      const [updated] = await tx
        .update(discounts)
        .set(payload)
        .where(and(eq(discounts.id, id), isNull(discounts.deletedAt)))
        .returning();

      if (!updated) throw new AppError(404, "Discount not found");

      if (productIds !== undefined) {
        await tx.delete(discountProducts).where(eq(discountProducts.discountId, id));
        if (productIds.length > 0) {
          await tx.insert(discountProducts).values(
            productIds.map((productId) => ({
              discountId: id,
              productId,
              tenantId: req.tenantId,
            })),
          );
        }
      }

      const links = await tx
        .select({ productId: discountProducts.productId })
        .from(discountProducts)
        .where(eq(discountProducts.discountId, id));

      return { ...updated, productIds: links.map((l) => l.productId) };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    await withTenant(req, async (tx) => {
      const [current] = await tx
        .select({ id: discounts.id })
        .from(discounts)
        .where(and(eq(discounts.id, id), isNull(discounts.deletedAt)))
        .limit(1);

      if (!current) throw new AppError(404, "Discount not found");

      await tx.update(discounts).set(softDelete()).where(eq(discounts.id, id));
      await tx.delete(discountProducts).where(eq(discountProducts.discountId, id));
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
