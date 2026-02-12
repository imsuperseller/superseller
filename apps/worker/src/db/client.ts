import { Pool } from "pg";
import { config } from "../config";
import { logger } from "../utils/logger";

export const pool = new Pool({
    connectionString: config.db.url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
    logger.error(err, "Unexpected PostgreSQL error:");
});

export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
        logger.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
    }

    return result.rows as T[];
}

export async function queryOne<T = any>(
    text: string,
    params?: any[]
): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows[0] || null;
}

export async function transaction<T>(
    fn: (client: any) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
