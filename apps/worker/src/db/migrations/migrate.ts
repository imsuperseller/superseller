import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { pool } from "../client";
import { logger } from "../../utils/logger";

async function migrate() {
    logger.info("🚀 Starting migrations...");

    // Create migrations tracking table
    await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

    // Get executed migrations
    const { rows: executed } = await pool.query(
        "SELECT filename FROM _migrations ORDER BY id"
    );
    const executedSet = new Set(executed.map((r) => r.filename));

    // Get migration files
    const migrationsDir = join(__dirname);
    const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

    for (const file of files) {
        if (executedSet.has(file)) {
            logger.info(`⏭️  Skipping ${file} (already executed)`);
            continue;
        }

        logger.info(`🔄 Running ${file}...`);
        const sql = readFileSync(join(migrationsDir, file), "utf-8");

        try {
            await pool.query("BEGIN");
            await pool.query(sql);
            await pool.query(
                "INSERT INTO _migrations (filename) VALUES ($1)",
                [file]
            );
            await pool.query("COMMIT");
            logger.info(`✅ ${file} completed`);
        } catch (err) {
            await pool.query("ROLLBACK");
            logger.error(`❌ ${file} failed: ${err}`);
            process.exit(1);
        }
    }

    logger.info("✅ All migrations complete");
    await pool.end();
}

migrate().catch((err) => {
    console.error("Migration fatal error:", err);
    process.exit(1);
});
