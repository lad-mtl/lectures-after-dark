PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'subscribed', 'unsubscribed', 'bounced', 'complained')),
  source TEXT NOT NULL DEFAULT 'website',
  consent_version TEXT NOT NULL DEFAULT '2026-01',
  consented_at TEXT,
  confirmation_token_hash TEXT,
  confirmation_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
  ON newsletter_subscribers(status);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id TEXT PRIMARY KEY,
  eventbrite_event_id TEXT UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_schedule
  ON newsletter_campaigns(status, scheduled_at);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id TEXT NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'deferred', 'bounced', 'complained', 'failed')),
  message_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (campaign_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_campaign
  ON newsletter_deliveries(campaign_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_deliveries_message
  ON newsletter_deliveries(message_id)
  WHERE message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS newsletter_webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  action TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  error TEXT,
  UNIQUE (provider, external_event_id, action)
);
