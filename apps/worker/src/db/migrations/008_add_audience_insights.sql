-- Audience insights: aggregate research from follower_snapshots
-- One row per account+platform. See FOLLOWER_OUTREACH_PIPELINE_SPEC.md

CREATE TABLE IF NOT EXISTS audience_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  scraped_at TIMESTAMPTZ,
  segments JSONB,
  top_products JSONB,
  messaging_angles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audience_insights_account_platform ON audience_insights(account_id, platform);
