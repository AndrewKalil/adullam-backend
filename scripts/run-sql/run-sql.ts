import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

import { env } from "../../src/config";
import { FILES, SQL_DIR } from "./run-sql.constants";

async function runSql() {
  const client = postgres(env.databaseUrl);

  for (const file of FILES) {
    const filePath = join(SQL_DIR, file);
    const sqlContent = readFileSync(filePath, "utf-8");
    console.log(`Running ${file}...`);
    await client.unsafe(sqlContent);
    console.log(`  done.`);
  }

  await client.end();
  console.log("All SQL files applied.");
}

runSql().catch((err) => {
  console.error(err);
  process.exit(1);
});
