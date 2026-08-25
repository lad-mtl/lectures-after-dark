PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS event_feedback_campaigns (
  id TEXT PRIMARY KEY,
  eventbrite_event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  event_timezone TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_campaigns_schedule
  ON event_feedback_campaigns(status, scheduled_at);

CREATE TABLE IF NOT EXISTS event_feedback_deliveries (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES event_feedback_campaigns(id) ON DELETE CASCADE,
  eventbrite_attendee_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL COLLATE NOCASE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'deferred', 'bounced', 'complained', 'failed')),
  message_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (campaign_id, eventbrite_attendee_id),
  UNIQUE (campaign_id, recipient_email)
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_deliveries_campaign
  ON event_feedback_deliveries(campaign_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_feedback_deliveries_message
  ON event_feedback_deliveries(message_id)
  WHERE message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS event_feedback_suppressions (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribed', 'bounced', 'complained')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
