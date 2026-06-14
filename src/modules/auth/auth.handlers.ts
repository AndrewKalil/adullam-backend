import type { NextFunction, Request, Response } from "express";

import { supabase, supabaseAdmin } from "~integrations";
import { AppError } from "~types";

import type { LoginBody, RefreshBody } from "./auth.types";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw new AppError(401, error?.message ?? "Invalid credentials");
    }

    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshBody;
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new AppError(401, error?.message ?? "Invalid or expired refresh token");
    }

    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await supabaseAdmin.auth.admin.signOut(req.userId);
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
