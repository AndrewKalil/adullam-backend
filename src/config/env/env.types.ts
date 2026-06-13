type NodeEnv = "production" | "development";

export type Env = {
  port: number;
  nodeEnv: NodeEnv;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  databaseUrl: string;
  storageBucket: string;
};
