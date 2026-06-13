import type { NextFunction, Request, Response } from "express";

import { AppError } from "~types";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  // Unknown error — log it, return generic 500
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
