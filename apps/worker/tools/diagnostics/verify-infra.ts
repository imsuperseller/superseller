import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { query } from "../../src/db/client";
import { logger } from "../../src/utils/logger";
import Redis from "ioredis";
import { config } from "../../src/config";

async function verifyInfra() {
    logger.info("🔍 Verifying Infrastructure...");

    try {
        const res = await query("SELECT NOW()", []);
        logger.info("✅ PostgreSQL: Connected (" + res[0].now + ")");
    } catch (err: any) {
        logger.error("❌ PostgreSQL: Failed - " + err.message);
    }

    try {
        const redis = new Redis(config.redis.url);
        await redis.ping();
        logger.info("✅ Redis: Connected");
        await redis.quit();
    } catch (err: any) {
        logger.error("❌ Redis: Failed - " + err.message);
    }

    process.exit(0);
}

verifyInfra();
