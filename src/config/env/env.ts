import { Env } from "./env.types";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env: Env = {
  port: parseInt(process.env["PORT"] ?? "3000", 10),
  nodeEnv:
    (process.env["NODE_ENV"] as Env["nodeEnv"] | undefined) ?? "development",
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  databaseUrl: requireEnv("DATABASE_URL"),
  storageBucket: requireEnv("STORAGE_BUCKET"),
};
