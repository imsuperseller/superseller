-- Landing Page Analytics: PageView + ConversionEvent tables
-- Created for Task 9: Hair Approach customer analytics/ROI dashboard

CREATE TABLE IF NOT EXISTS page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL,
  referrer   TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_hash    TEXT,
  country    TEXT,
  device     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_slug_created ON page_views (slug, created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_slug ON page_views (slug);

CREATE TABLE IF NOT EXISTS conversion_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata   JSONB,
  ip_hash    TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_slug_created ON conversion_events (slug, created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_slug_type ON conversion_events (slug, event_type);
