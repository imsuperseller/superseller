-- Migration 010: Add content_actors table
-- Matches Drizzle schema: apps/worker-packages/db/src/schema.ts (contentActors)

CREATE TABLE IF NOT EXISTS content_actors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    sora_cameo_url TEXT,
    thumbnail_url TEXT,
    voice_id TEXT,
    appearance_notes TEXT,
    available_for JSONB DEFAULT '["reel", "story", "carousel"]'::jsonb,
    usage_count INTEGER DEFAULT 0,
    avg_engagement DOUBLE PRECISION,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_actors_tenant ON content_actors (tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_actors_role ON content_actors (role);
