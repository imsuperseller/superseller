-- 009: Unified notification log
-- Replaces scattered WhatsApp notifications with a trackable, queryable log.

CREATE TABLE IF NOT EXISTS notification_log (
    id              SERIAL PRIMARY KEY,
    correlation_id  UUID DEFAULT gen_random_uuid(),
    source          TEXT NOT NULL,  -- health_monitor | cookie_monitor | claudeclaw | approval_service | scheduler | system
    type            TEXT NOT NULL,  -- alert | info | action_required | action_taken | error | success
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    metadata        JSONB DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'sent',  -- sent | delivered | read | handled | failed
    sent_via        TEXT,           -- whatsapp | email | admin_dashboard
    sent_to         TEXT,           -- phone number or email
    related_entity_type TEXT,       -- service | customer | job | session
    related_entity_id   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    handled_at      TIMESTAMPTZ,
    handled_by      TEXT           -- auto | user | claudeclaw
);

CREATE INDEX IF NOT EXISTS idx_notification_log_source ON notification_log(source);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(type);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_log_created ON notification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_correlation ON notification_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_entity ON notification_log(related_entity_type, related_entity_id);
