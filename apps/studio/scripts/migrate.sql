-- ============================================================
-- Winner Video Studio — Database Migration v1.0
-- ============================================================
-- All tables prefixed with winner_ to avoid collision with
-- existing Prisma-managed tables in the same database.
-- Run: node scripts/migrate.mjs  (or psql $DATABASE_URL -f scripts/migrate.sql)
-- ============================================================

BEGIN;

-- ============================================================
-- TABLE 1: winner_users
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             VARCHAR(50) NOT NULL DEFAULT 'mivnim',
  name                  VARCHAR(255),
  email                 VARCHAR(255),
  phone                 VARCHAR(20),
  whatsapp_jid          VARCHAR(50),
  auth_method           VARCHAR(20) CHECK (auth_method IN ('email', 'whatsapp')),
  magic_link_token      VARCHAR(255),
  magic_link_expires_at TIMESTAMPTZ,
  stripe_customer_id    VARCHAR(255),
  default_image_url     TEXT,
  brand_library_configured BOOLEAN DEFAULT FALSE,
  tier                  VARCHAR(20) NOT NULL DEFAULT 'starter'
                        CHECK (tier IN ('none', 'starter', 'pro', 'elite')),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login            TIMESTAMPTZ,
  CONSTRAINT winner_users_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_winner_users_email
  ON winner_users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_winner_users_phone
  ON winner_users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_winner_users_tenant
  ON winner_users(tenant_id);

-- ============================================================
-- TABLE 2: winner_user_credits
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_user_credits (
  user_id               UUID PRIMARY KEY REFERENCES winner_users(id) ON DELETE CASCADE,
  tier                  VARCHAR(20) NOT NULL DEFAULT 'starter',
  total_credits         INTEGER NOT NULL DEFAULT 5,
  used_credits          INTEGER NOT NULL DEFAULT 0,
  available_credits     INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  monthly_cap           INTEGER DEFAULT 30,
  monthly_used          INTEGER NOT NULL DEFAULT 0,
  monthly_reset_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  subscription_started_at  TIMESTAMPTZ,
  subscription_expires_at  TIMESTAMPTZ,
  stripe_subscription_id   VARCHAR(255),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: winner_credit_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_credit_transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES winner_users(id) ON DELETE CASCADE,
  type                  VARCHAR(20) NOT NULL
                        CHECK (type IN ('consume', 'refund', 'purchase', 'bonus', 'expire')),
  amount                INTEGER NOT NULL,
  balance_after         INTEGER NOT NULL,
  generation_id         UUID,
  stripe_payment_id     VARCHAR(255),
  description           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winner_credit_tx_user
  ON winner_credit_transactions(user_id, created_at DESC);

-- ============================================================
-- TABLE 4: winner_generations
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_generations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES winner_users(id) ON DELETE CASCADE,
  tenant_id             VARCHAR(50) NOT NULL DEFAULT 'mivnim',
  -- User Inputs
  raw_script            TEXT,
  input_audio_url       TEXT,
  input_audio_duration  DECIMAL(6,2),
  reference_image_url   TEXT,
  character             VARCHAR(50),
  vibe                  VARCHAR(50),
  language              VARCHAR(10) DEFAULT 'he',
  content_type_hint     VARCHAR(30),
  -- Gemini Brain Outputs
  processed_script      TEXT,
  video_prompt          TEXT,
  recommended_model     VARCHAR(100),
  model_params          JSONB,
  routing_reasoning     TEXT,
  content_tags          TEXT[],
  music_prompt          JSONB,
  needs_isolation       BOOLEAN DEFAULT FALSE,
  voice_clarity_score   INTEGER,
  subtitle_text         TEXT,
  gemini_raw_json       JSONB,
  -- Pipeline State
  stage                 VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (stage IN (
                          'PENDING', 'SCRIPT_PROCESSING', 'AUDIO_ISOLATING',
                          'VIDEO_GENERATING', 'MUSIC_GENERATING', 'AWAITING_MUSIC_SELECT',
                          'POST_PROCESSING', 'DELIVERING', 'COMPLETE', 'FAILED'
                        )),
  -- Task IDs
  gemini_task_id        VARCHAR(100),
  isolation_task_id     VARCHAR(100),
  video_task_id         VARCHAR(100),
  suno_task_id          VARCHAR(100),
  ffmpeg_job_id         VARCHAR(100),
  -- Audio Isolation Results
  cleaned_audio_url     TEXT,
  -- Video Generation Results
  video_model_used      VARCHAR(100),
  video_result_url      TEXT,
  raw_video_r2_url      TEXT,
  -- Music Results (Phase 2)
  selected_music_url    TEXT,
  music_selected_at     TIMESTAMPTZ,
  -- Post-Processing Results (Phase 2)
  final_video_url       TEXT,
  final_duration        DECIMAL(6,2),
  final_resolution      VARCHAR(10),
  file_size_mb          DECIMAL(8,2),
  -- Delivery
  whatsapp_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_message_id   VARCHAR(255),
  delivered_at          TIMESTAMPTZ,
  -- Revision Tracking
  is_revision           BOOLEAN NOT NULL DEFAULT FALSE,
  parent_generation_id  UUID REFERENCES winner_generations(id),
  revision_number       INTEGER NOT NULL DEFAULT 0,
  -- Error Handling
  error_message         TEXT,
  failed_at_stage       VARCHAR(30),
  retry_count           INTEGER NOT NULL DEFAULT 0,
  -- Credits
  credits_charged       INTEGER NOT NULL DEFAULT 1,
  credit_refunded       BOOLEAN NOT NULL DEFAULT FALSE,
  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_winner_gen_user
  ON winner_generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_winner_gen_stage
  ON winner_generations(stage);
CREATE INDEX IF NOT EXISTS idx_winner_gen_tenant
  ON winner_generations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_winner_gen_active
  ON winner_generations(stage, updated_at) WHERE stage NOT IN ('COMPLETE', 'FAILED');

-- FK on credit_transactions
ALTER TABLE winner_credit_transactions
  ADD CONSTRAINT fk_winner_credit_tx_generation
  FOREIGN KEY (generation_id) REFERENCES winner_generations(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE 5: winner_generation_events
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_generation_events (
  id                    SERIAL PRIMARY KEY,
  generation_id         UUID NOT NULL REFERENCES winner_generations(id) ON DELETE CASCADE,
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
  payload               JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winner_events_generation
  ON winner_generation_events(generation_id, created_at);

-- ============================================================
-- TABLE 6: winner_music_tracks (Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_music_tracks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id         UUID NOT NULL REFERENCES winner_generations(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_winner_music_gen
  ON winner_music_tracks(generation_id);

-- ============================================================
-- TABLE 7: winner_generation_costs
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_generation_costs (
  generation_id         UUID PRIMARY KEY REFERENCES winner_generations(id) ON DELETE CASCADE,
  gemini_credits        DECIMAL(10,4),
  isolation_credits     DECIMAL(10,4),
  video_credits         DECIMAL(10,4),
  suno_credits          DECIMAL(10,4),
  total_kie_credits     DECIMAL(10,4) GENERATED ALWAYS AS (
                          COALESCE(gemini_credits, 0) + COALESCE(isolation_credits, 0) +
                          COALESCE(video_credits, 0) + COALESCE(suno_credits, 0)
                        ) STORED,
  estimated_cost_usd    DECIMAL(10,4),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 8: winner_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES winner_users(id) ON DELETE CASCADE,
  token                 VARCHAR(255) UNIQUE NOT NULL,
  user_agent            TEXT,
  ip_address            VARCHAR(45),
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winner_sessions_token
  ON winner_sessions(token);
CREATE INDEX IF NOT EXISTS idx_winner_sessions_user
  ON winner_sessions(user_id);

-- ============================================================
-- TABLE 9: winner_api_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_api_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id         UUID REFERENCES winner_generations(id) ON DELETE SET NULL,
  service               VARCHAR(50) NOT NULL,
  method                VARCHAR(10),
  endpoint              TEXT,
  request_body          JSONB,
  response_code         INTEGER,
  response_body         JSONB,
  latency_ms            INTEGER,
  kie_credits_consumed  DECIMAL(10,4),
  attempt               INTEGER DEFAULT 1,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winner_api_logs_gen
  ON winner_api_logs(generation_id);
CREATE INDEX IF NOT EXISTS idx_winner_api_logs_service
  ON winner_api_logs(service, created_at DESC);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION winner_trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_winner_users') THEN
    CREATE TRIGGER set_updated_at_winner_users
      BEFORE UPDATE ON winner_users
      FOR EACH ROW EXECUTE FUNCTION winner_trigger_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_winner_generations') THEN
    CREATE TRIGGER set_updated_at_winner_generations
      BEFORE UPDATE ON winner_generations
      FOR EACH ROW EXECUTE FUNCTION winner_trigger_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_winner_user_credits') THEN
    CREATE TRIGGER set_updated_at_winner_user_credits
      BEFORE UPDATE ON winner_user_credits
      FOR EACH ROW EXECUTE FUNCTION winner_trigger_set_updated_at();
  END IF;
END $$;

-- ============================================================
-- HELPERS
-- ============================================================
CREATE OR REPLACE FUNCTION winner_cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM winner_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION winner_reset_monthly_caps()
RETURNS INTEGER AS $$
DECLARE reset_count INTEGER;
BEGIN
  UPDATE winner_user_credits
  SET monthly_used = 0,
      monthly_reset_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
  WHERE monthly_reset_at < NOW();
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
