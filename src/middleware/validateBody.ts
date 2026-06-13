import type { NextFunction, Request, Response } from "express";
import type { AnyObjectSchema } from "yup";
import { ValidationError } from "yup";
import { AppError } from "../types";

export const validateBody = (schema: AnyObjectSchema) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        const details = err.inner.map((e) => ({
          field: e.path ?? "",
          message: e.message,
        }));
        next(new AppError(422, "Validation failed", details));
        return;
      }
      next(err);
    }
  };
};
