import type { NextFunction, Request, Response } from "express";

import { supabase } from "~integrations";
import { AppError } from "~types";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or malformed Authorization header");
    }

    const token = authHeader.slice(7); // remove "Bearer "
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError(401, "Invalid or expired token");
    }

    req.userId = data.user.id;
    req.claims = {
      sub: data.user.id,
      email: data.user.email,
      ...data.user.user_metadata,
    };

    next();
  } catch (err) {
    next(err);
  }
};
