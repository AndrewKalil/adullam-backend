import { and, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

import { categories, withTenant } from "~db";
import { AppError } from "~types";
import { softDelete } from "~utils";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.types";

export const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rows = await withTenant(req, (tx) =>
      tx
        .select()
        .from(categories)
        .where(isNull(categories.deletedAt))
        .orderBy(categories.name),
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const [row] = await withTenant(req, (tx) =>
      tx
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .limit(1),
    );

    if (!row) throw new AppError(404, "Category not found");
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateCategoryInput;

    const [row] = await withTenant(req, (tx) =>
      tx
        .insert(categories)
        .values({ ...body, tenantId: req.tenantId })
        .returning(),
    );

    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const fields = req.body as UpdateCategoryInput;

    const [updated] = await withTenant(req, (tx) =>
      tx
        .update(categories)
        .set(fields)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .returning(),
    );

    if (!updated) throw new AppError(404, "Category not found");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    await withTenant(req, async (tx) => {
      const [current] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .limit(1);

      if (!current) throw new AppError(404, "Category not found");

      await tx
        .update(categories)
        .set(softDelete())
        .where(eq(categories.id, id));
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
