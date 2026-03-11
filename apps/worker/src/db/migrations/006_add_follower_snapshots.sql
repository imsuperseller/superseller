-- Follower snapshots for baseline + daily delta (outreach pipeline)
CREATE TABLE IF NOT EXISTS follower_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    source_handle TEXT NOT NULL,
    follower_id TEXT,
    follower_username TEXT,
    follower_name TEXT,
    profile_url TEXT,
    profile_pic_url TEXT,
    follower_count INT,
    raw JSONB DEFAULT '{}',
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follower_snapshots_account_platform ON follower_snapshots(account_id, platform);
CREATE INDEX IF NOT EXISTS idx_follower_snapshots_scraped ON follower_snapshots(scraped_at);
