-- Follower outreach: research + pre-filter columns
-- See FOLLOWER_OUTREACH_PIPELINE_SPEC.md

ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS profile_bio TEXT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS research_status TEXT DEFAULT 'pending';
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS skip_reason TEXT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS individual_research JSONB;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS fit_score INT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS behavior_score INT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS timing_score INT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS prospect_score INT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS prospect_reasons JSONB;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS warmth_tier TEXT;
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS researched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_follower_snapshots_research_status ON follower_snapshots(research_status);
