-- Credit-based gating: entitlements and usage_events for API cost management
-- Aligns with Prisma Entitlement/UsageEvent and CreditManager
-- Run after 001_initial_schema.sql (worker DB has users, video_jobs)

-- Entitlements (credits balance per user)
CREATE TABLE IF NOT EXISTS entitlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    credits_balance INT NOT NULL DEFAULT 0,
    plan            VARCHAR(50) NOT NULL DEFAULT 'starter',
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    reset_at        TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);

-- Add credit-specific columns to usage_events (001 creates with event_type, credits_used)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usage_events' AND column_name = 'type'
    ) THEN
        ALTER TABLE usage_events ADD COLUMN type VARCHAR(50);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usage_events' AND column_name = 'amount'
    ) THEN
        ALTER TABLE usage_events ADD COLUMN amount INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usage_events' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE usage_events ADD COLUMN metadata JSONB;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usage_events' AND column_name = 'job_id'
    ) THEN
        ALTER TABLE usage_events ADD COLUMN job_id UUID REFERENCES video_jobs(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usage_events_job ON usage_events(job_id);
