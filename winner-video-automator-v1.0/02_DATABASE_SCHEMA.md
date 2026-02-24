# Doc 2: Database Schema

> **Purpose:** Complete Postgres migration SQL, Redis key patterns, migration script, and seed data.
> **Action:** Run the migration script after project scaffolding. Schema works with both Vercel Postgres (Neon) and standard Postgres 15+.

---

## 1. Provider Compatibility

This schema is designed to work with **both** database providers:

| Feature | Vercel Postgres (Neon) | Racknerd Postgres |
|---------|----------------------|-------------------|
| `gen_random_uuid()` | ✅ Native | ✅ Native (PG 13+) |
| `GENERATED ALWAYS AS ... STORED` | ✅ Supported | ✅ Supported |
| `TIMESTAMPTZ` | ✅ Supported | ✅ Supported |
| `JSONB` | ✅ Supported | ✅ Supported |
| `TEXT[]` arrays | ✅ Supported | ✅ Supported |
| Connection pooling | ✅ Built-in (PgBouncer) | ❌ Need manual setup |
| Max connections | 100 (free tier) | Unlimited (self-managed) |

**Vercel Postgres connection string format:**
```
postgres://default:PASSWORD@ep-XXX.us-east-2.aws.neon.tech/verceldb?sslmode=require
```

**Racknerd connection string format (if firewall opened):**
```
postgresql://admin:a1efbcd564b928d3ef1d7cae@172.245.56.50:5432/app_db
```

---

## 2. Full Migration SQL

Create as `scripts/migrate.sql`:

```sql
-- ============================================================
-- Winner Video Studio — Database Migration v1.0
-- ============================================================
-- Compatible with: Vercel Postgres (Neon) and PostgreSQL 15+
-- Run: psql $DATABASE_URL -f scripts/migrate.sql
-- ============================================================

BEGIN;

-- ============================================================
-- EXTENSIONS
-- ============================================================
-- pgcrypto for gen_random_uuid() — already available on Neon
-- On standard Postgres, may need: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLE 1: users
-- ============================================================
-- Core user identity. Supports email + WhatsApp dual auth.
-- tenant_id enables multi-tenant from day 1.

CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             VARCHAR(50) NOT NULL DEFAULT 'mivnim',
  
  -- Identity
  name                  VARCHAR(255),
  email                 VARCHAR(255),
  phone                 VARCHAR(20),
  whatsapp_jid          VARCHAR(50),        -- e.g. "972501234567@c.us"
  
  -- Auth
  auth_method           VARCHAR(20) CHECK (auth_method IN ('email', 'whatsapp')),
  magic_link_token      VARCHAR(255),
  magic_link_expires_at TIMESTAMPTZ,
  
  -- Stripe (Phase 2)
  stripe_customer_id    VARCHAR(255),
  
  -- Profile
  default_image_url     TEXT,               -- Default headshot/avatar for video generation
  brand_library_configured BOOLEAN DEFAULT FALSE,
  
  -- Status
  tier                  VARCHAR(20) NOT NULL DEFAULT 'starter' 
                        CHECK (tier IN ('none', 'starter', 'pro', 'elite')),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login            TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT users_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Unique indexes allowing NULLs (Postgres treats NULL != NULL in UNIQUE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
  ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone 
  ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant 
  ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe 
  ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;


-- ============================================================
-- TABLE 2: user_credits
-- ============================================================
-- Separated from users to avoid lock contention on credit updates.
-- 1:1 with users table.

CREATE TABLE IF NOT EXISTS user_credits (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tier                  VARCHAR(20) NOT NULL DEFAULT 'starter',
  
  -- Credit pool
  total_credits         INTEGER NOT NULL DEFAULT 5,    -- Phase 1: 5 starter credits
  used_credits          INTEGER NOT NULL DEFAULT 0,
  available_credits     INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  
  -- Monthly cap
  monthly_cap           INTEGER DEFAULT 30,            -- Phase 1: generous default
  monthly_used          INTEGER NOT NULL DEFAULT 0,
  monthly_reset_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Subscription (Phase 2)
  subscription_started_at  TIMESTAMPTZ,
  subscription_expires_at  TIMESTAMPTZ,
  stripe_subscription_id   VARCHAR(255),
  
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE 3: credit_transactions
-- ============================================================
-- Immutable audit log of all credit movements.
-- Types: 'consume' (generation start), 'refund' (failed gen),
--        'purchase' (Stripe), 'bonus' (manual grant), 'expire'.

CREATE TABLE IF NOT EXISTS credit_transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                  VARCHAR(20) NOT NULL 
                        CHECK (type IN ('consume', 'refund', 'purchase', 'bonus', 'expire')),
  amount                INTEGER NOT NULL,              -- negative for consume, positive for refund/purchase
  balance_after         INTEGER NOT NULL,              -- snapshot of available_credits after this tx
  generation_id         UUID,                          -- FK added after generations table exists
  stripe_payment_id     VARCHAR(255),
  description           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user 
  ON credit_transactions(user_id, created_at DESC);


-- ============================================================
-- TABLE 4: generations
-- ============================================================
-- The heart of the system. Each row = one video generation attempt.
-- Tracks the full pipeline from input to delivery.

CREATE TABLE IF NOT EXISTS generations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id             VARCHAR(50) NOT NULL DEFAULT 'mivnim',
  
  -- ─── User Inputs ───
  raw_script            TEXT,                          -- Original text/transcript
  input_audio_url       TEXT,                          -- R2 URL of uploaded audio
  input_audio_duration  DECIMAL(6,2),                  -- Duration in seconds
  reference_image_url   TEXT,                          -- Optional headshot/image
  character             VARCHAR(50),                   -- Character ID from constants
  vibe                  VARCHAR(50),                   -- Vibe ID from constants
  language              VARCHAR(10) DEFAULT 'he',
  content_type_hint     VARCHAR(30),                   -- User hint: 'podcast', 'ad', 'announcement'
  
  -- ─── Gemini Brain Outputs ───
  processed_script      TEXT,                          -- Rewritten "Poscas Winner" script
  video_prompt          TEXT,                          -- Visual scene description (max 500 chars)
  recommended_model     VARCHAR(100),                  -- Model ID from registry
  model_params          JSONB,                         -- Full params for kie.ai createTask
  routing_reasoning     TEXT,                          -- Why Gemini chose this model
  content_tags          TEXT[],                        -- Auto-detected tags
  music_prompt          JSONB,                         -- Suno prompt object
  needs_isolation       BOOLEAN DEFAULT FALSE,
  voice_clarity_score   INTEGER,                       -- 1-10 from Gemini
  subtitle_text         TEXT,                          -- Generated subtitle content
  gemini_raw_json       JSONB,                         -- Full Gemini response for debugging
  
  -- ─── Pipeline State ───
  stage                 VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (stage IN (
                          'PENDING',
                          'SCRIPT_PROCESSING',
                          'AUDIO_ISOLATING',
                          'VIDEO_GENERATING',
                          'MUSIC_GENERATING',
                          'AWAITING_MUSIC_SELECT',
                          'POST_PROCESSING',
                          'DELIVERING',
                          'COMPLETE',
                          'FAILED'
                        )),
  
  -- ─── Task IDs (kie.ai async tasks) ───
  gemini_task_id        VARCHAR(100),                  -- Not async, but track for logging
  isolation_task_id     VARCHAR(100),
  video_task_id         VARCHAR(100),
  suno_task_id          VARCHAR(100),
  ffmpeg_job_id         VARCHAR(100),                  -- Phase 2
  
  -- ─── Audio Isolation Results ───
  cleaned_audio_url     TEXT,                          -- R2 URL after isolation
  
  -- ─── Video Generation Results ───
  video_model_used      VARCHAR(100),                  -- Actual model used (may differ from recommended)
  video_result_url      TEXT,                          -- Raw URL from kie.ai
  raw_video_r2_url      TEXT,                          -- Backed up to R2
  
  -- ─── Music Results (Phase 2) ───
  selected_music_url    TEXT,
  music_selected_at     TIMESTAMPTZ,
  
  -- ─── Post-Processing Results (Phase 2) ───
  final_video_url       TEXT,                          -- After FFmpeg: logo, subs, music mix
  final_duration        DECIMAL(6,2),
  final_resolution      VARCHAR(10),                   -- '720p', '480p'
  file_size_mb          DECIMAL(8,2),
  
  -- ─── Delivery ───
  whatsapp_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_message_id   VARCHAR(255),
  delivered_at          TIMESTAMPTZ,
  
  -- ─── Revision Tracking ───
  is_revision           BOOLEAN NOT NULL DEFAULT FALSE,
  parent_generation_id  UUID REFERENCES generations(id),
  revision_number       INTEGER NOT NULL DEFAULT 0,
  
  -- ─── Error Handling ───
  error_message         TEXT,
  failed_at_stage       VARCHAR(30),
  retry_count           INTEGER NOT NULL DEFAULT 0,
  
  -- ─── Credits ───
  credits_charged       INTEGER NOT NULL DEFAULT 1,
  credit_refunded       BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- ─── Timestamps ───
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gen_user 
  ON generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_stage 
  ON generations(stage);
CREATE INDEX IF NOT EXISTS idx_gen_tenant 
  ON generations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gen_parent 
  ON generations(parent_generation_id) WHERE parent_generation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gen_active 
  ON generations(stage, updated_at) WHERE stage NOT IN ('COMPLETE', 'FAILED');

-- Now add the FK on credit_transactions
ALTER TABLE credit_transactions 
  ADD CONSTRAINT fk_credit_tx_generation 
  FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE SET NULL;


-- ============================================================
-- TABLE 5: generation_events
-- ============================================================
-- Immutable audit trail for pipeline debugging.
-- Every stage transition, callback, error, retry gets logged.

CREATE TABLE IF NOT EXISTS generation_events (
  id                    SERIAL PRIMARY KEY,
  generation_id         UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  stage                 VARCHAR(30) NOT NULL,
  event_type            VARCHAR(30) NOT NULL 
                        CHECK (event_type IN (
                          'stage_enter', 'stage_exit',
                          'callback_received', 'callback_error',
                          'task_created', 'task_polled',
                          'error', 'retry',
                          'credit_consumed', 'credit_refunded',
                          'delivery_sent', 'delivery_confirmed'
                        )),
  payload               JSONB,                         -- Flexible data per event type
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_generation 
  ON generation_events(generation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type 
  ON generation_events(event_type, created_at DESC);


-- ============================================================
-- TABLE 6: music_tracks (Phase 2, create now for schema stability)
-- ============================================================
-- Suno generates 3 options per generation.
-- User selects one (or auto-select after 24hr timeout).

CREATE TABLE IF NOT EXISTS music_tracks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id         UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  suno_track_id         VARCHAR(255) NOT NULL,
  audio_url             TEXT NOT NULL,
  stream_audio_url      TEXT,
  cover_image_url       TEXT,
  title                 VARCHAR(255),
  tags                  VARCHAR(500),
  duration              DECIMAL(8,2),
  is_selected           BOOLEAN NOT NULL DEFAULT FALSE,
  r2_backup_url         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_gen 
  ON music_tracks(generation_id);


-- ============================================================
-- TABLE 7: generation_costs
-- ============================================================
-- Track actual API costs per generation for margin monitoring.
-- kie.ai returns credits_consumed in responses.

CREATE TABLE IF NOT EXISTS generation_costs (
  generation_id         UUID PRIMARY KEY REFERENCES generations(id) ON DELETE CASCADE,
  gemini_credits        DECIMAL(10,4),                 -- kie.ai credits for Gemini call
  isolation_credits     DECIMAL(10,4),                 -- kie.ai credits for audio isolation
  video_credits         DECIMAL(10,4),                 -- kie.ai credits for video generation
  suno_credits          DECIMAL(10,4),                 -- kie.ai credits for music generation
  total_kie_credits     DECIMAL(10,4) GENERATED ALWAYS AS (
                          COALESCE(gemini_credits, 0) + COALESCE(isolation_credits, 0) +
                          COALESCE(video_credits, 0) + COALESCE(suno_credits, 0)
                        ) STORED,
  estimated_cost_usd    DECIMAL(10,4),                 -- Estimated dollar cost
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE 8: sessions
-- ============================================================
-- Server-side session storage. Token stored in httpOnly cookie.
-- Expires after 7 days of inactivity.

CREATE TABLE IF NOT EXISTS sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token                 VARCHAR(255) UNIQUE NOT NULL,
  user_agent            TEXT,
  ip_address            VARCHAR(45),
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token 
  ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user 
  ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires 
  ON sessions(expires_at);


-- ============================================================
-- TABLE 9: api_logs
-- ============================================================
-- Log every external API call for debugging and cost tracking.
-- Retention: auto-purge after 30 days via cron.

CREATE TABLE IF NOT EXISTS api_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id         UUID REFERENCES generations(id) ON DELETE SET NULL,
  service               VARCHAR(50) NOT NULL,          -- 'kie', 'gemini', 'waha', 'resend', 'r2'
  method                VARCHAR(10),
  endpoint              TEXT,
  request_body          JSONB,
  response_code         INTEGER,
  response_body         JSONB,
  latency_ms            INTEGER,
  kie_credits_consumed  DECIMAL(10,4),                 -- From kie.ai response
  attempt               INTEGER DEFAULT 1,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_gen 
  ON api_logs(generation_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_service 
  ON api_logs(service, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_errors 
  ON api_logs(response_code) WHERE response_code >= 400;


-- ============================================================
-- HELPER: updated_at auto-trigger
-- ============================================================
-- Automatically updates `updated_at` on row modification.

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_generations
  BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_credits
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- HELPER: Cleanup expired sessions (run via cron)
-- ============================================================
-- Call: SELECT cleanup_expired_sessions();

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- HELPER: Monthly credit cap reset (run via daily cron)
-- ============================================================
-- Call: SELECT reset_monthly_caps();

CREATE OR REPLACE FUNCTION reset_monthly_caps()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE user_credits 
  SET monthly_used = 0, 
      monthly_reset_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
  WHERE monthly_reset_at < NOW();
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql;


COMMIT;
```

---

## 3. Redis Key Patterns

For **Upstash Redis** (serverless, REST API) or standard Redis on Racknerd.

### Task Tracking Keys

```
winner:task:{kieTaskId}
  Value:  JSON { generationId, stage, model, attempt, createdAt }
  TTL:    3600s (1 hour)
  Set:    When any kie.ai createTask is fired
  Read:   Callback handler looks up generationId from taskId
  Delete: After callback processed successfully
  
  Example:
  winner:task:abc123def456 → {
    "generationId": "550e8400-e29b-41d4-a716-446655440000",
    "stage": "VIDEO_GENERATING",
    "model": "kling/ai-avatar-standard",
    "attempt": 1,
    "createdAt": 1771455826000
  }
```

### State Cache Keys

```
winner:state:{generationId}
  Value:  Stage string (e.g. "VIDEO_GENERATING")
  TTL:    7200s (2 hours)
  Set:    On every stage transition
  Read:   Dashboard polling (avoid hitting Postgres)
  
winner:user:credits:{userId}
  Value:  JSON { available, monthlyRemaining, tier }
  TTL:    300s (5 min)
  Set:    After credit check / transaction
  Read:   Dashboard credit badge, generate endpoint pre-check
  Delete: On any credit change (invalidation)
```

### Rate Limiting Keys

```
winner:rate:generate:{userId}
  Value:  Counter (incremented per generation)
  TTL:    3600s (1 hour)
  Max:    5 (5 generations per hour per user)
  
winner:rate:concurrent:{userId}
  Value:  Counter (incremented on start, decremented on complete/fail)
  TTL:    600s (10 min fallback)
  Max:    2 (max 2 active generations at once)
```

### Auth Keys

```
winner:magic:{token}
  Value:  JSON { userId, email, expiresAt }
  TTL:    900s (15 minutes)
  Set:    When magic link sent
  Read:   When user clicks magic link
  Delete: After successful verification (one-time use)

winner:otp:{phone}
  Value:  JSON { code, userId, attempts, expiresAt }
  TTL:    300s (5 minutes)
  Set:    When WhatsApp OTP sent
  Read:   When user submits OTP
  Delete: After successful verification
  Max attempts: 3 (then regen required)
```

### Cron / Polling Keys

```
winner:stuck:checked
  Value:  Timestamp of last cron run
  TTL:    180s (3 min)
  Set:    At start of check-stuck cron
  Read:   Cron checks if another instance already running (dedup)
```

### Key Naming Convention

All keys use the `winner:` prefix to namespace within shared Redis.

```
winner:{domain}:{identifier}

Domains:
  task      — kie.ai async task tracking
  state     — generation state cache
  user      — user-level caches
  rate      — rate limiting counters
  magic     — magic link tokens
  otp       — WhatsApp OTP codes
  stuck     — cron deduplication
```

---

## 4. Migration Runner Script

Create as `scripts/migrate.mjs`:

```javascript
// scripts/migrate.mjs
// Usage: node scripts/migrate.mjs
// Reads DATABASE_URL from .env.local or environment

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if exists
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
} catch { /* .env.local not found, use environment */ }

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL or POSTGRES_URL not set');
  process.exit(1);
}

async function migrate() {
  const client = new pg.Client({ 
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = readFileSync(resolve(__dirname, 'migrate.sql'), 'utf-8');
    await client.query(sql);
    console.log('✅ Migration complete');

    // Verify tables
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log(`✅ Tables (${rows.length}):`);
    rows.forEach(r => console.log(`   - ${r.tablename}`));

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
```

---

## 5. Seed Script

Create as `scripts/seed.mjs`:

```javascript
// scripts/seed.mjs
// Usage: node scripts/seed.mjs
// Seeds the database with Yossi (first customer) and starter data.

import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
} catch { /* .env.local not found */ }

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function seed() {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // ─── Seed Yossi (first customer) ───
    const yossiResult = await client.query(`
      INSERT INTO users (tenant_id, name, email, phone, whatsapp_jid, auth_method, tier)
      VALUES ('mivnim', 'Yossi Laham', NULL, NULL, NULL, 'whatsapp', 'starter')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let yossiId;
    if (yossiResult.rows.length > 0) {
      yossiId = yossiResult.rows[0].id;
      console.log(`✅ Created user: Yossi Laham (${yossiId})`);
    } else {
      // Already exists, find him
      const existing = await client.query(`SELECT id FROM users WHERE name = 'Yossi Laham' LIMIT 1`);
      yossiId = existing.rows[0]?.id;
      console.log(`ℹ️  Yossi already exists (${yossiId})`);
    }

    if (yossiId) {
      // Give Yossi starter credits
      await client.query(`
        INSERT INTO user_credits (user_id, tier, total_credits, monthly_cap)
        VALUES ($1, 'starter', 10, 30)
        ON CONFLICT (user_id) DO UPDATE SET total_credits = 10
      `, [yossiId]);
      console.log('✅ Yossi credits: 10 starter credits');

      // Log the bonus
      await client.query(`
        INSERT INTO credit_transactions (user_id, type, amount, balance_after, description)
        VALUES ($1, 'bonus', 10, 10, 'Phase 1 beta testing credits')
      `, [yossiId]);
    }

    // ─── Seed Shai (admin/agency) ───
    const shaiResult = await client.query(`
      INSERT INTO users (tenant_id, name, email, phone, whatsapp_jid, auth_method, tier)
      VALUES ('mivnim', 'Shai Friedman', 'service@rensto.com', '+14695885133', '14695885133@c.us', 'email', 'elite')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let shaiId;
    if (shaiResult.rows.length > 0) {
      shaiId = shaiResult.rows[0].id;
      console.log(`✅ Created user: Shai Friedman (${shaiId})`);
    } else {
      const existing = await client.query(`SELECT id FROM users WHERE email = 'service@rensto.com' LIMIT 1`);
      shaiId = existing.rows[0]?.id;
      console.log(`ℹ️  Shai already exists (${shaiId})`);
    }

    if (shaiId) {
      await client.query(`
        INSERT INTO user_credits (user_id, tier, total_credits, monthly_cap)
        VALUES ($1, 'elite', 999, 999)
        ON CONFLICT (user_id) DO UPDATE SET total_credits = 999
      `, [shaiId]);
      console.log('✅ Shai credits: 999 (admin)');
    }

    // ─── Summary ───
    const { rows: userCount } = await client.query('SELECT COUNT(*) as count FROM users');
    const { rows: creditCount } = await client.query('SELECT COUNT(*) as count FROM user_credits');
    console.log(`\n✅ Seed complete: ${userCount[0].count} users, ${creditCount[0].count} credit records`);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
```

---

## 6. Entity Relationship Diagram

```
┌──────────────┐       1:1        ┌──────────────────┐
│    users     │──────────────────▶│   user_credits   │
│              │                   │                  │
│ id (PK)      │                   │ user_id (PK,FK)  │
│ tenant_id    │                   │ total_credits    │
│ name         │                   │ used_credits     │
│ email        │                   │ available_credits│
│ phone        │                   │ monthly_cap      │
│ whatsapp_jid │                   │ monthly_used     │
│ tier         │                   │ tier             │
└──────┬───────┘                   └──────────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐     1:N      ┌──────────────────┐
│   generations    │─────────────▶│generation_events  │
│                  │              │                  │
│ id (PK)          │              │ generation_id(FK)│
│ user_id (FK)     │              │ stage            │
│ tenant_id        │              │ event_type       │
│ stage            │              │ payload (JSONB)  │
│ ...pipeline...   │              └──────────────────┘
│ ...results...    │
└──────┬───┬───────┘
       │   │
       │   │ 1:N                  ┌──────────────────┐
       │   └─────────────────────▶│  music_tracks    │
       │                          │                  │
       │                          │ generation_id(FK)│
       │                          │ suno_track_id    │
       │                          │ is_selected      │
       │                          └──────────────────┘
       │
       │ 1:1                      ┌──────────────────┐
       └─────────────────────────▶│ generation_costs │
                                  │                  │
                                  │ generation_id(PK)│
                                  │ gemini_credits   │
                                  │ video_credits    │
                                  │ total_kie_credits│
                                  └──────────────────┘

       ┌──────────────────┐
       │    sessions      │
       │                  │
       │ user_id (FK)     │
       │ token (UNIQUE)   │
       │ expires_at       │
       └──────────────────┘

       ┌──────────────────┐
       │    api_logs      │
       │                  │
       │ generation_id(FK)│
       │ service          │
       │ endpoint         │
       │ response_code    │
       │ latency_ms       │
       └──────────────────┘

┌──────────────────────┐
│ credit_transactions  │
│                      │
│ user_id (FK)         │
│ generation_id (FK)   │
│ type                 │
│ amount               │
│ balance_after        │
└──────────────────────┘
```

---

## 7. Key Query Patterns

These are the queries the application will run most frequently. Index design supports all of them.

### Dashboard: Get user's recent generations
```sql
SELECT id, stage, character, vibe, final_video_url, 
       video_result_url, created_at, completed_at
FROM generations 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20;
```

### Gallery: Get completed videos
```sql
SELECT id, final_video_url, raw_video_r2_url, video_result_url,
       processed_script, character, vibe, video_model_used,
       final_duration, created_at
FROM generations
WHERE user_id = $1 AND stage = 'COMPLETE'
ORDER BY completed_at DESC
LIMIT 50;
```

### Pipeline: Get generation for stage transition
```sql
SELECT * FROM generations WHERE id = $1 FOR UPDATE;
-- FOR UPDATE prevents race conditions on concurrent callbacks
```

### Credit check before generation
```sql
SELECT available_credits, monthly_cap - monthly_used as monthly_remaining
FROM user_credits 
WHERE user_id = $1;
```

### Credit consumption (atomic)
```sql
BEGIN;
  UPDATE user_credits 
  SET used_credits = used_credits + 1, 
      monthly_used = monthly_used + 1
  WHERE user_id = $1 AND available_credits > 0 AND monthly_used < monthly_cap
  RETURNING available_credits;
  -- If no rows returned → insufficient credits
  
  INSERT INTO credit_transactions (user_id, type, amount, balance_after, generation_id, description)
  VALUES ($1, 'consume', -1, (SELECT available_credits FROM user_credits WHERE user_id = $1), $2, 'Video generation');
COMMIT;
```

### Credit refund on failure
```sql
BEGIN;
  UPDATE user_credits 
  SET used_credits = used_credits - 1, 
      monthly_used = monthly_used - 1
  WHERE user_id = $1;
  
  UPDATE generations 
  SET credit_refunded = TRUE 
  WHERE id = $2;
  
  INSERT INTO credit_transactions (user_id, type, amount, balance_after, generation_id, description)
  VALUES ($1, 'refund', 1, (SELECT available_credits FROM user_credits WHERE user_id = $1), $2, 'Generation failed — automatic refund');
COMMIT;
```

### Cron: Find stuck generations
```sql
SELECT g.id, g.stage, g.video_task_id, g.isolation_task_id, g.updated_at
FROM generations g
WHERE g.stage IN ('AUDIO_ISOLATING', 'VIDEO_GENERATING', 'MUSIC_GENERATING')
  AND g.updated_at < NOW() - INTERVAL '10 minutes'
  AND g.retry_count < 3;
```

### Admin: Generation costs summary
```sql
SELECT 
  DATE(g.created_at) as day,
  COUNT(*) as total_gens,
  AVG(gc.total_kie_credits) as avg_kie_credits,
  SUM(gc.estimated_cost_usd) as total_cost_usd,
  COUNT(*) FILTER (WHERE g.stage = 'COMPLETE') as completed,
  COUNT(*) FILTER (WHERE g.stage = 'FAILED') as failed
FROM generations g
LEFT JOIN generation_costs gc ON gc.generation_id = g.id
WHERE g.created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(g.created_at)
ORDER BY day DESC;
```

---

## 8. Table Summary

| Table | Rows (expected Phase 1) | Growth Rate | Purpose |
|-------|------------------------|-------------|---------|
| `users` | 2-10 | Slow (invite-only) | User identity + auth |
| `user_credits` | 2-10 | 1:1 with users | Credit balance tracking |
| `credit_transactions` | 50-200 | ~2 per generation | Immutable credit audit log |
| `generations` | 50-500 | ~5-20/day | Core pipeline state |
| `generation_events` | 250-2500 | ~5 per generation | Pipeline debugging trail |
| `music_tracks` | 0 (Phase 2) | 3 per generation | Suno music options |
| `generation_costs` | 50-500 | 1 per generation | COGS tracking |
| `sessions` | 2-10 | Login events | Auth sessions |
| `api_logs` | 500-5000 | ~10 per generation | External API debugging |

**Total storage estimate Phase 1:** < 50MB. Well within any free tier.

---

## 9. Maintenance Queries

### Purge old API logs (run weekly)
```sql
DELETE FROM api_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

### Purge expired sessions (run daily)
```sql
SELECT cleanup_expired_sessions();
```

### Reset monthly caps (run daily at 00:00 UTC)
```sql
SELECT reset_monthly_caps();
```

### Vacuum after bulk deletes
```sql
VACUUM ANALYZE api_logs;
VACUUM ANALYZE sessions;
```

---

## 10. Rollback Script

If migration needs to be undone:

```sql
-- scripts/rollback.sql
-- WARNING: Destroys all data. Use only in development.

BEGIN;
DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS generation_costs CASCADE;
DROP TABLE IF EXISTS music_tracks CASCADE;
DROP TABLE IF EXISTS generation_events CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS generations CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS trigger_set_updated_at CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_caps CASCADE;
COMMIT;
```
