import { readdirSync } from "fs";
import { join } from "path";

export const SQL_DIR = join(__dirname, "..", "..", "sql");

export const FILES = readdirSync(SQL_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort((a, b) => {
    const numA = parseInt(a.split("_")[0], 10);
    const numB = parseInt(b.split("_")[0], 10);
    return numA - numB;
  });
