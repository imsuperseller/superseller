-- Migration: Firestore → Postgres for FB Marketplace Bot
-- Replaces 3 Firestore collections: posting_schedule, clients+secrets, post_runs

-- 1. Clients (merges Firestore 'clients' + 'secrets' collections)
CREATE TABLE IF NOT EXISTS marketplace_clients (
  id            TEXT PRIMARY KEY,
  category      TEXT DEFAULT 'Property for Rent',
  config        JSONB DEFAULT '{}',
  secrets       JSONB DEFAULT '{}',
  last_run      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posting schedule (replaces Firestore 'posting_schedule' collection)
CREATE TABLE IF NOT EXISTS marketplace_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     TEXT NOT NULL REFERENCES marketplace_clients(id),
  status        TEXT NOT NULL DEFAULT 'queued',
  scheduled_for TIMESTAMPTZ NOT NULL,
  title         TEXT,
  price         NUMERIC(10,2),
  description   TEXT,
  image_url     TEXT,
  location      TEXT DEFAULT 'Dallas, TX',
  run_id        UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mkt_sched_status ON marketplace_schedules(status, scheduled_for);

-- 3. Post run logs (replaces Firestore 'post_runs' collection)
CREATE TABLE IF NOT EXISTS marketplace_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     TEXT NOT NULL REFERENCES marketplace_clients(id),
  schedule_id   UUID REFERENCES marketplace_schedules(id),
  status        TEXT NOT NULL,
  marketplace_url TEXT,
  error         JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mkt_runs_client ON marketplace_runs(client_id, created_at DESC);
