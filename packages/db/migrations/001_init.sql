-- Rensto Zero-Dupes Database Schema
-- This ensures global uniqueness and prevents duplicates across all systems

-- Entities table - single source of truth for all entities
CREATE TABLE entities (
  rgid TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                -- 'customer' | 'agent' | 'workflow' | 'template' | ...
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX entities_kind_slug_uq ON entities(kind, slug);

-- External identity => single canonical entity
CREATE TABLE external_identities (
  provider TEXT NOT NULL,            -- 'airtable' | 'webflow' | 'n8n' | 'sellerassistant' | ...
  external_id TEXT NOT NULL,
  rgid TEXT NOT NULL REFERENCES entities(rgid) ON DELETE CASCADE,
  source_version TEXT,               -- etag/updatedAt for idempotency
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (provider, external_id)
);

-- Dedupe ledger for webhooks and jobs
CREATE TABLE idempotency_keys (
  scope TEXT NOT NULL,               -- 'webhook:<provider>' | 'job:<queue>' | 'api:<route>'
  key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT now(),
  payload_hash TEXT NOT NULL,
  PRIMARY KEY (scope, key)
);

-- Raw ingestion tracking
CREATE TABLE raw_ingestions (
  id SERIAL PRIMARY KEY,
  rgid TEXT REFERENCES entities(rgid),
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  source_version TEXT,
  payload_hash TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Normalization tracking
CREATE TABLE normalizations (
  id SERIAL PRIMARY KEY,
  rgid TEXT NOT NULL REFERENCES entities(rgid),
  provider TEXT NOT NULL,
  status TEXT NOT NULL,              -- 'success' | 'failed' | 'skipped'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BMAD project tracking
CREATE TABLE bmad_projects (
  id SERIAL PRIMARY KEY,
  project_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL,               -- 'build' | 'measure' | 'analyze' | 'deploy'
  status TEXT NOT NULL,              -- 'pending' | 'running' | 'completed' | 'failed'
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer data with RGID
CREATE TABLE customers (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent configurations
CREATE TABLE agents (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  name TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'content' | 'social' | 'analytics' | 'communication'
  customer_rgid TEXT REFERENCES customers(rgid),
  config JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow definitions
CREATE TABLE workflows (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  name TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'n8n' | 'automation' | 'integration'
  customer_rgid TEXT REFERENCES customers(rgid),
  definition JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking with deduplication
CREATE TABLE usage_events (
  id SERIAL PRIMARY KEY,
  rgid TEXT REFERENCES entities(rgid),
  event_type TEXT NOT NULL,          -- 'api_call' | 'workflow_run' | 'agent_execution'
  provider TEXT NOT NULL,
  external_id TEXT,
  cost DECIMAL(10,4),
  metadata JSONB,
  dedupe_key TEXT UNIQUE,            -- Prevents duplicate events
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_entities_kind ON entities(kind);
CREATE INDEX idx_external_identities_rgid ON external_identities(rgid);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_agents_customer ON agents(customer_rgid);
CREATE INDEX idx_workflows_customer ON workflows(customer_rgid);
CREATE INDEX idx_usage_events_rgid ON usage_events(rgid);
CREATE INDEX idx_usage_events_dedupe ON usage_events(dedupe_key);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bmad_projects_updated_at BEFORE UPDATE ON bmad_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
