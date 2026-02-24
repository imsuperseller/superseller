-- Migration: add_notification_llm_registry_usage_cost
-- Adds: notifications table, llm_model_configs table, costUsd/modelId/tokensUsed to usage_events

-- 1. LLM Model Config Registry
CREATE TABLE IF NOT EXISTS "llm_model_configs" (
    "id"                  TEXT PRIMARY KEY,
    "provider"            TEXT NOT NULL,
    "display_name"        TEXT NOT NULL,
    "used_in"             JSONB NOT NULL DEFAULT '[]',
    "is_active"           BOOLEAN NOT NULL DEFAULT true,
    "input_cost_per_1m"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "output_cost_per_1m"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supports_vision"     BOOLEAN NOT NULL DEFAULT false,
    "supports_tools"      BOOLEAN NOT NULL DEFAULT true,
    "context_window_k"    INTEGER,
    "notes"               TEXT,
    "last_seen_at"        TIMESTAMP(3),
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "llm_model_configs_provider_idx" ON "llm_model_configs"("provider");
CREATE INDEX IF NOT EXISTS "llm_model_configs_is_active_idx" ON "llm_model_configs"("is_active");

-- 2. Add cost tracking columns to usage_events
ALTER TABLE "usage_events"
    ADD COLUMN IF NOT EXISTS "model_id"     TEXT,
    ADD COLUMN IF NOT EXISTS "cost_usd"     DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "tokens_used"  INTEGER;

CREATE INDEX IF NOT EXISTS "usage_events_model_id_idx" ON "usage_events"("model_id");

ALTER TABLE "usage_events"
    ADD CONSTRAINT IF NOT EXISTS "usage_events_model_id_fkey"
    FOREIGN KEY ("model_id") REFERENCES "llm_model_configs"("id") ON DELETE SET NULL;

-- 3. Notifications table (in-app, WhatsApp, email, push)
CREATE TABLE IF NOT EXISTS "notifications" (
    "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"        UUID NOT NULL,
    "type"           TEXT NOT NULL,
    "channel"        TEXT NOT NULL DEFAULT 'in_app',
    "title"          TEXT NOT NULL,
    "body"           TEXT NOT NULL,
    "action_url"     TEXT,
    "metadata"       JSONB,
    "read"           BOOLEAN NOT NULL DEFAULT false,
    "read_at"        TIMESTAMP(3),
    "delivered_at"   TIMESTAMP(3),
    "delivery_error" TEXT,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"     TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx"   ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_read_idx"       ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "notifications_channel_idx"    ON "notifications"("channel");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");

ALTER TABLE "notifications"
    ADD CONSTRAINT IF NOT EXISTS "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE;

-- 4. Seed: Initial LLM Model Config Registry
INSERT INTO "llm_model_configs" ("id","provider","display_name","used_in","is_active","input_cost_per_1m","output_cost_per_1m","supports_vision","supports_tools","context_window_k","notes")
VALUES
    ('gpt-4o',               'openai',    'GPT-4o',                 '["whatsapp-agent","lead-scoring"]',                  true, 2.50, 10.00, true,  true,  128, 'Default for structured tasks'),
    ('gpt-4o-mini',          'openai',    'GPT-4o Mini',            '["content-pipeline","seo-agent"]',                   true, 0.15,  0.60, false, true,  128, 'Budget tasks'),
    ('claude-3-5-sonnet',    'anthropic', 'Claude 3.5 Sonnet',      '["terry-admin","support-ai"]',                       true, 3.00, 15.00, true,  true,  200, 'Admin AI Terry'),
    ('claude-3-haiku',       'anthropic', 'Claude 3 Haiku',         '["whatsapp-triage"]',                                true, 0.25,  1.25, false, true,  200, 'Fast WhatsApp triage'),
    ('gemini-2.0-flash',     'google',    'Gemini 2.0 Flash',       '["video-pipeline"]',                                 true, 0.07,  0.30, true,  true,   32, 'Video scene descriptions'),
    ('gemini-1.5-pro',       'google',    'Gemini 1.5 Pro',         '["video-pipeline","content-pipeline"]',              true, 1.25,  5.00, true,  true, 2000, 'Long-context analysis'),
    ('nomic-embed-text',     'ollama',    'Nomic Embed Text (RAG)',  '["rag-index","semantic-search"]',                   true,  0,     0,   false, false, 8,   'Local RAG embeddings on RackNerd'),
    ('llama3.1-8b',          'ollama',    'Llama 3.1 8B',           '["local-fallback"]',                                 true,  0,     0,   false, true,  128, 'Local fallback on RackNerd')
ON CONFLICT ("id") DO NOTHING;
