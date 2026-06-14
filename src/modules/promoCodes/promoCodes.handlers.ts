import { and, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

import { promoCodes, withTenant } from "~db";
import { AppError } from "~types";
import { softDelete } from "~utils";

import type { CreatePromoCodeInput, UpdatePromoCodeInput } from "./promoCodes.types";

export const listPromoCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rows = await withTenant(req, (tx) =>
      tx
        .select()
        .from(promoCodes)
        .where(isNull(promoCodes.deletedAt))
        .orderBy(promoCodes.code),
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getPromoCodeById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const [row] = await withTenant(req, (tx) =>
      tx
        .select()
        .from(promoCodes)
        .where(and(eq(promoCodes.id, id), isNull(promoCodes.deletedAt)))
        .limit(1),
    );

    if (!row) throw new AppError(404, "Promo code not found");
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const createPromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { expiresAt, discountValue, minOrderAmount, ...rest } =
      req.body as CreatePromoCodeInput;

    const [row] = await withTenant(req, (tx) =>
      tx
        .insert(promoCodes)
        .values({
          ...rest,
          tenantId: req.tenantId,
          discountValue: String(discountValue),
          minOrderAmount: minOrderAmount != null ? String(minOrderAmount) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        })
        .returning(),
    );

    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const updatePromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const { expiresAt, discountValue, minOrderAmount, ...rest } =
      req.body as UpdatePromoCodeInput;

    const payload = {
      ...rest,
      ...(discountValue !== undefined && { discountValue: String(discountValue) }),
      ...(minOrderAmount !== undefined && {
        minOrderAmount: minOrderAmount != null ? String(minOrderAmount) : null,
      }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    };

    const [updated] = await withTenant(req, (tx) =>
      tx
        .update(promoCodes)
        .set(payload)
        .where(and(eq(promoCodes.id, id), isNull(promoCodes.deletedAt)))
        .returning(),
    );

    if (!updated) throw new AppError(404, "Promo code not found");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    await withTenant(req, async (tx) => {
      const [current] = await tx
        .select({ id: promoCodes.id })
        .from(promoCodes)
        .where(and(eq(promoCodes.id, id), isNull(promoCodes.deletedAt)))
        .limit(1);

      if (!current) throw new AppError(404, "Promo code not found");

      await tx.update(promoCodes).set(softDelete()).where(eq(promoCodes.id, id));
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
