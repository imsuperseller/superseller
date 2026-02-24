import { Pool, type QueryResultRow } from "pg";
import { getEnv } from "./env";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: getEnv().DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query<T>(sql, params);
  return rows;
}

export async function queryRow<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function transaction<T>(
  fn: (client: {
    query: <R extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<R[]>;
    queryRow: <R extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<R | null>;
  }) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn({
      query: async <R extends QueryResultRow>(sql: string, params?: unknown[]) => {
        const { rows } = await client.query<R>(sql, params);
        return rows;
      },
      queryRow: async <R extends QueryResultRow>(sql: string, params?: unknown[]): Promise<R | null> => {
        const { rows } = await client.query<R>(sql, params);
        return rows[0] ?? null;
      },
    });
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
