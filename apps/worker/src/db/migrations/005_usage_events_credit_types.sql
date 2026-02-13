-- Extend usage_events event_type CHECK to allow credit system types
ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_type_check
    CHECK (event_type IN (
        'video_generated', 'video_failed', 'clip_retry', 'premium_export',
        'credit_debit', 'credit_refund', 'credit_topup', 'credit_grant', 'credit_reset'
    ));
