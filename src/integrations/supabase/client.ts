import { createClient } from "@supabase/supabase-js";
import { env } from "~config";

// Anon client — used for JWT verification (auth.getUser)
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Service role client — used for Storage presigned URLs (Ticket 07)
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
);
