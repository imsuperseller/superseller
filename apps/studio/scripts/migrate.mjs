import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
try {
  const envFile = readFileSync(resolve(__dirname, "..", ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  }
} catch {
  /* .env.local not found */
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function migrate() {
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log("Connected to database");

    const sql = readFileSync(resolve(__dirname, "migrate.sql"), "utf-8");
    await client.query(sql);
    console.log("Migration complete");

    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'winner_%'
      ORDER BY tablename
    `);
    console.log(`Winner tables (${rows.length}):`);
    rows.forEach((r) => console.log(`  - ${r.tablename}`));
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
