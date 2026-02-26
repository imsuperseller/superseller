import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

async function seed() {
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log("Connected to database");

    // Seed Yossi Laham (first customer — Mivnim Group)
    const yossi = await client.query(
      `INSERT INTO winner_users (tenant_id, name, phone, whatsapp_jid, auth_method, tier)
       VALUES ('mivnim', 'Yossi Laham', '+972501234567', '972501234567@c.us', 'whatsapp', 'starter')
       ON CONFLICT DO NOTHING
       RETURNING id`
    );
    const yossiId = yossi.rows[0]?.id;
    if (yossiId) {
      await client.query(
        `INSERT INTO winner_user_credits (user_id, tier, total_credits, monthly_cap)
         VALUES ($1, 'starter', 10, 30)
         ON CONFLICT (user_id) DO UPDATE SET total_credits = 10`,
        [yossiId]
      );
      await client.query(
        `INSERT INTO winner_credit_transactions (user_id, type, amount, balance_after, description)
         VALUES ($1, 'bonus', 10, 10, 'Phase 1 beta testing credits')`,
        [yossiId]
      );
      console.log(`Yossi Laham created (${yossiId}) — 10 credits`);
    } else {
      console.log("Yossi already exists");
    }

    // Seed Shai Friedman (admin)
    const shai = await client.query(
      `INSERT INTO winner_users (tenant_id, name, email, phone, whatsapp_jid, auth_method, tier)
       VALUES ('mivnim', 'Shai Friedman', 'shai@superseller.agency', '+14695885133', '14695885133@c.us', 'email', 'elite')
       ON CONFLICT DO NOTHING
       RETURNING id`
    );
    const shaiId = shai.rows[0]?.id;
    if (shaiId) {
      await client.query(
        `INSERT INTO winner_user_credits (user_id, tier, total_credits, monthly_cap)
         VALUES ($1, 'elite', 999, 999)
         ON CONFLICT (user_id) DO UPDATE SET total_credits = 999`,
        [shaiId]
      );
      console.log(`Shai Friedman created (${shaiId}) — 999 credits`);
    } else {
      console.log("Shai already exists");
    }

    // Summary
    const { rows: users } = await client.query("SELECT COUNT(*) as c FROM winner_users");
    const { rows: credits } = await client.query("SELECT COUNT(*) as c FROM winner_user_credits");
    console.log(`\nSeed complete: ${users[0].c} users, ${credits[0].c} credit records`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
