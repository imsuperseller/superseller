const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Fetches the next due items from the posting schedule.
 */
async function getPendingSchedule() {
  const { rows } = await pool.query(
    `SELECT id, client_id AS "clientId", status, scheduled_for,
            title, price, description, image_url AS "imageUrl", location
     FROM marketplace_schedules
     WHERE status = 'queued' AND scheduled_for <= NOW()
     ORDER BY scheduled_for
     LIMIT 5`
  );
  return rows;
}

/**
 * Fetches client details including secrets.
 */
async function getClientData(clientId) {
  const { rows } = await pool.query(
    `SELECT id, category, config, secrets, last_run AS "lastRun"
     FROM marketplace_clients WHERE id = $1`,
    [clientId]
  );
  if (rows.length === 0) throw new Error(`Client ${clientId} not found`);
  const client = rows[0];
  return {
    ...client.config,
    category: client.category,
    secrets: client.secrets || {},
  };
}

/**
 * Updates a schedule item's status.
 */
async function updateScheduleStatus(scheduleId, status, runId = null) {
  await pool.query(
    `UPDATE marketplace_schedules
     SET status = $1, run_id = $2, updated_at = NOW()
     WHERE id = $3`,
    [status, runId, scheduleId]
  );
}

/**
 * Logs the result of a posting run.
 */
async function logPostRun(clientId, result) {
  const { rows } = await pool.query(
    `INSERT INTO marketplace_runs (client_id, schedule_id, status, marketplace_url, error)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      clientId,
      result.scheduleId || null,
      result.status,
      result.marketplaceUrl || null,
      result.error ? JSON.stringify(result.error) : null,
    ]
  );
  const runId = rows[0].id;

  // Update client's lastRun
  await pool.query(
    `UPDATE marketplace_clients
     SET last_run = $1, updated_at = NOW()
     WHERE id = $2`,
    [
      JSON.stringify({ runId, status: result.status, timestamp: new Date().toISOString() }),
      clientId,
    ]
  );

  return runId;
}

/**
 * Graceful shutdown
 */
async function closeDb() {
  await pool.end();
}

module.exports = {
  pool,
  getPendingSchedule,
  getClientData,
  updateScheduleStatus,
  logPostRun,
  closeDb,
};
