import type { NextFunction, Request, Response } from "express";
import { object, string, ValidationError } from "yup";

import { getPublicUrl, signUploadUrl } from "~integrations/supabase";
import { AppError } from "~types";

const signSchema = object({
  fileName: string().min(1).max(200).required(),
  contentType: string()
    .matches(/^image\//, "Only image content types are allowed")
    .required(),
});

export const createSignedUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let parsed: { fileName: string; contentType: string };
    try {
      parsed = await signSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        const details = err.inner.map((e) => ({
          field: e.path ?? "",
          message: e.message,
        }));
        throw new AppError(422, "Validation failed", details);
      }
      throw err;
    }

    const { fileName, contentType } = parsed;
    const result = await signUploadUrl(fileName, contentType);

    res.json({
      signedUrl: result.signedUrl,
      path: result.path,
      token: result.token,
      publicUrl: getPublicUrl(result.path),
    });
  } catch (err) {
    next(err);
  }
};
