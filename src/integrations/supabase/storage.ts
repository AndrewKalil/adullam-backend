import { randomUUID } from "crypto";
import { extname } from "path";

import { env } from "~config";

import { supabaseAdmin } from "./client";

export interface SignedUploadResult {
  signedUrl: string;
  path: string;
  token: string;
}

export const signUploadUrl = async (
  fileName: string,
  _contentType: string,
): Promise<SignedUploadResult> => {
  const ext = extname(fileName) || ".jpg";
  const path = `temp/${randomUUID()}${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(env.storageBucket)
    .createSignedUploadUrl(path);

  if (error) throw new Error(`Storage sign failed: ${error.message}`);

  return {
    signedUrl: data.signedUrl,
    path,
    token: data.token,
  };
};

export const getPublicUrl = (path: string): string => {
  const { data } = supabaseAdmin.storage
    .from(env.storageBucket)
    .getPublicUrl(path);
  return data.publicUrl;
};
