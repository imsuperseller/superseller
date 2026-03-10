-- VideoForge Database Schema v1
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id        VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    phone           VARCHAR(50),
    company         VARCHAR(255),
    license_number  VARCHAR(100),
    avatar_url      TEXT,
    stripe_customer_id VARCHAR(255),
    subscription_tier  VARCHAR(50) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
    videos_used_this_month INT DEFAULT 0,
    videos_limit    INT DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_clerk ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- LISTINGS
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address         VARCHAR(500) NOT NULL,
    city            VARCHAR(255),
    state           VARCHAR(50),
    zip             VARCHAR(20),
    property_type   VARCHAR(50) DEFAULT 'house'
        CHECK (property_type IN ('house', 'condo', 'apartment', 'townhouse', 'commercial', 'land')),
    bedrooms        INT,
    bathrooms       DECIMAL(3,1),
    sqft            INT,
    listing_price   DECIMAL(12,2),
    mls_number      VARCHAR(50),
    exterior_photo_url TEXT,
    floorplan_url   TEXT,
    floorplan_analysis JSONB,
    additional_photos JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- VIDEO JOBS
CREATE TABLE video_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'analyzing', 'generating_prompts',
            'generating_clips', 'awaiting_approval',
            'stitching', 'adding_music', 'exporting',
            'uploading', 'complete', 'failed', 'cancelled'
        )),
    model_preference VARCHAR(50) DEFAULT 'kling_3'
        CHECK (model_preference IN ('kling_3', 'veo_31_fast', 'veo_31_quality')),
    tour_sequence   JSONB,
    music_style     VARCHAR(100) DEFAULT 'elegant',
    music_track_id  UUID,
    transition_style VARCHAR(50) DEFAULT 'fade'
        CHECK (transition_style IN (
            'fade', 'dissolve', 'wipeleft', 'wiperight',
            'circleopen', 'circleclose', 'radial', 'smoothleft'
        )),
    include_exterior BOOLEAN DEFAULT true,
    include_backyard BOOLEAN DEFAULT false,
    total_clips     INT,
    completed_clips INT DEFAULT 0,
    current_step    VARCHAR(100),
    progress_percent INT DEFAULT 0
        CHECK (progress_percent >= 0 AND progress_percent <= 100),
    master_video_url TEXT,
    square_video_url TEXT,
    vertical_video_url TEXT,
    portrait_video_url TEXT,
    thumbnail_url   TEXT,
    video_duration_seconds DECIMAL(6,2),
    total_api_cost  DECIMAL(10,4) DEFAULT 0,
    error_message   TEXT,
    error_code      VARCHAR(50),
    retry_count     INT DEFAULT 0,
    max_retries     INT DEFAULT 3,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_jobs_user ON video_jobs(user_id);
CREATE INDEX idx_jobs_listing ON video_jobs(listing_id);
CREATE INDEX idx_jobs_status ON video_jobs(status);
CREATE INDEX idx_jobs_created ON video_jobs(created_at DESC);

-- CLIPS
CREATE TABLE clips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_job_id    UUID NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
    clip_number     INT NOT NULL,
    from_room       VARCHAR(255),
    to_room         VARCHAR(255),
    prompt          TEXT NOT NULL,
    start_frame_url TEXT,
    end_frame_url   TEXT,
    model_used      VARCHAR(50),
    provider        VARCHAR(20)
        CHECK (provider IN ('fal', 'kie')),
    external_task_id VARCHAR(255),
    status          VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'generating', 'complete', 'failed', 'retrying', 'skipped')),
    video_url       TEXT,
    local_path      TEXT,
    duration_seconds DECIMAL(6,2),
    api_cost        DECIMAL(8,4) DEFAULT 0,
    generation_time_seconds INT,
    approved        BOOLEAN,
    rejection_reason TEXT,
    retry_count     INT DEFAULT 0,
    max_retries     INT DEFAULT 3,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    UNIQUE(video_job_id, clip_number)
);
CREATE INDEX idx_clips_job ON clips(video_job_id);
CREATE INDEX idx_clips_status ON clips(status);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id  VARCHAR(255) UNIQUE,
    stripe_price_id         VARCHAR(255),
    tier                    VARCHAR(50) NOT NULL
        CHECK (tier IN ('starter', 'pro', 'team')),
    status                  VARCHAR(50) DEFAULT 'active'
        CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    monthly_video_limit     INT NOT NULL,
    price_cents             INT NOT NULL,
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancel_at_period_end    BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- USAGE EVENTS
CREATE TABLE usage_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    video_job_id    UUID REFERENCES video_jobs(id),
    event_type      VARCHAR(50) NOT NULL
        CHECK (event_type IN ('video_generated', 'video_failed', 'clip_retry', 'premium_export')),
    credits_used    INT DEFAULT 1,
    api_cost        DECIMAL(8,4),
    stripe_meter_event_id VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- MUSIC TRACKS
CREATE TABLE music_tracks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    style           VARCHAR(100) NOT NULL,
    mood            VARCHAR(100),
    duration_seconds DECIMAL(6,2) NOT NULL,
    r2_url          TEXT NOT NULL,
    r2_key          TEXT NOT NULL,
    suno_task_id    VARCHAR(255),
    file_size_bytes BIGINT,
    is_active       BOOLEAN DEFAULT true,
    play_count      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated   BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated     BEFORE UPDATE ON video_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subs_updated     BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
