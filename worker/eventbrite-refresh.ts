import type { ContentEnv } from './content.ts';

// Cron invocations have a hard 15-minute wall-time limit. A 20-minute D1 lease
// outlives even a stalled/killed invocation; do not reuse this in request handlers
// or a runtime without that limit. KV is intentionally never used as a lock.
const LEASE_MS = 20 * 60_000;
export class EventbriteContentError extends Error {
  readonly retryAfterMs: number;
  constructor(message: string, retryAfterMs = 0) {
    super(message);
    this.retryAfterMs = retryAfterMs;
  }
}

export function eventbriteRetryAfter(value: string | null): number {
  if (!value) return 0;
  const seconds = /^\d+$/.test(value.trim()) ? Number(value) : NaN;
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(delay) && delay > 0 ? Math.min(delay, Number.MAX_SAFE_INTEGER - Date.now()) : 0;
}

const DB_NOW = "(unixepoch('now') * 1000)";

export async function cachedEventbriteOrganization(
  env: ContentEnv, baseUrl: string, token: string, discover: () => Promise<string>,
): Promise<string> {
  const input = JSON.stringify([baseUrl.replace(/\/+$/, ''), env.EVENTBRITE_ORGANIZATION_NAME?.trim().toLowerCase() || 'lectures after dark', token]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const db = env.NEWSLETTER_DB!;
  const cached = await db.prepare(`SELECT organization_id FROM eventbrite_content_refresh
    WHERE id = 'events' AND organization_key = ?1 AND organization_expires > ${DB_NOW}`)
    .bind(key).first<{ organization_id: string | null }>();
  if (cached?.organization_id) return cached.organization_id;
  const id = await discover();
  await db.prepare(`UPDATE eventbrite_content_refresh SET organization_id = ?1,
    organization_key = ?2, organization_expires = ${DB_NOW} + 86400000 WHERE id = 'events'`)
    .bind(id, key).run();
  return id;
}

export async function runEventbriteRefresh(env: ContentEnv, refresh: () => Promise<unknown>): Promise<void> {
  if (!env.NEWSLETTER_DB || !env.CONTENT_CACHE) {
    console.warn('Eventbrite scheduled refresh skipped: cache/coordination binding missing');
    return;
  }
  const db = env.NEWSLETTER_DB;
  const owner = crypto.randomUUID();
  const acquired = await db.prepare(`
    INSERT INTO eventbrite_content_refresh (id, owner, lease_until)
    VALUES ('events', ?1, ${DB_NOW} + ?2)
    ON CONFLICT(id) DO UPDATE SET owner = excluded.owner, lease_until = excluded.lease_until
    WHERE eventbrite_content_refresh.lease_until <= ${DB_NOW}
      AND eventbrite_content_refresh.next_attempt <= ${DB_NOW}
    RETURNING failures
  `).bind(owner, LEASE_MS).first<{ failures: number }>();
  if (!acquired) return;
  let failures = 0;
  let reason: string | null = null;
  let delay = 60_000; // Deduplicate immediate deliveries without skipping the next five-minute tick.
  try {
    await refresh();
  } catch (error) {
    failures = acquired.failures + 1;
    reason = error instanceof EventbriteContentError ? error.message
      : error instanceof Error && error.name === 'AbortError' ? 'eventbrite-timeout' : 'eventbrite-unreachable';
    const throttled = reason === 'eventbrite-http-429';
    const exponential = Math.min(60 * 60_000, (throttled ? 10 : 5) * 60_000 * 2 ** Math.min(failures - 1, 10));
    delay = Math.max(exponential, error instanceof EventbriteContentError ? error.retryAfterMs : 0);
    console.warn('Eventbrite scheduled refresh failed', { reason });
  }
  // A failed coordination write leaves the lease in place (fail closed).
  // D1's epoch clock has second precision; round up rather than retry early.
  await db.prepare(`UPDATE eventbrite_content_refresh SET lease_until = 0,
    next_attempt = ${DB_NOW} + 1000 + ?2, failures = ?3, last_error = ?4,
    organization_expires = CASE WHEN ?4 IN ('eventbrite-http-401', 'eventbrite-http-403', 'eventbrite-http-404') THEN 0 ELSE organization_expires END
    WHERE id = 'events' AND owner = ?1`).bind(owner, delay, failures, reason).run();
}
