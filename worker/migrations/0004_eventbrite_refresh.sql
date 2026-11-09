-- Website content coordination only; no newsletter tables or data are changed.
CREATE TABLE IF NOT EXISTS eventbrite_content_refresh (
  id TEXT PRIMARY KEY CHECK (id = 'events'),
  owner TEXT NOT NULL,
  lease_until INTEGER NOT NULL DEFAULT 0,
  next_attempt INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  organization_id TEXT,
  organization_key TEXT,
  organization_expires INTEGER NOT NULL DEFAULT 0
);
