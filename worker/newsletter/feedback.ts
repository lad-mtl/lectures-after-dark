import { getEmailSettings } from "../settings";
import { sendEventFeedbackEmail } from "./email";
import type {
  EmailSendingEvent,
  EventFeedbackCampaign,
  EventFeedbackDelivery,
  NewsletterEnv,
} from "./types";
import {
  createFeedbackUnsubscribeToken,
  escapeHtml,
  htmlToText,
  isValidEmail,
  normalizeEmail,
  requireDatabase,
} from "./utils";

export interface FeedbackEventDetails {
  id: string;
  name: string;
  endUtc: string;
  timezone: string;
}

interface EventbriteFeedbackEvent {
  id?: string;
  organizer_id?: string;
  status?: string;
  start?: { timezone?: string };
  end?: { utc?: string; timezone?: string };
}

interface EventbriteAttendee {
  id?: string;
  checked_in?: boolean;
  cancelled?: boolean;
  refunded?: boolean | string;
  profile?: {
    email?: string;
  };
}

interface EventbriteAttendeePage {
  attendees?: EventbriteAttendee[];
  pagination?: {
    page_number?: number;
    page_count?: number;
    has_more_items?: boolean;
    has_more?: boolean;
  };
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedTimeToUtc(options: {
  year: number;
  month: number;
  day: number;
  hour: number;
  timeZone: string;
}) {
  const target = Date.UTC(options.year, options.month - 1, options.day, options.hour);
  let guess = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = zonedParts(new Date(guess), options.timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    guess += target - actualAsUtc;
  }

  return new Date(guess);
}

export function feedbackDeliveryTime(endUtc: string, timeZone: string, sendHour = 10) {
  const end = new Date(endUtc);
  if (Number.isNaN(end.getTime())) throw new Error("Eventbrite event end time is invalid.");

  // Use a UTC calendar date only as a convenient way to advance the event's local date by one day.
  const localEnd = zonedParts(end, timeZone);
  const nextDate = new Date(Date.UTC(localEnd.year, localEnd.month - 1, localEnd.day + 1));
  return zonedTimeToUtc({
    year: nextDate.getUTCFullYear(),
    month: nextDate.getUTCMonth() + 1,
    day: nextDate.getUTCDate(),
    hour: Math.min(23, Math.max(0, sendHour)),
    timeZone,
  });
}

function renderTextTemplate(template: string, eventName: string) {
  return template.replaceAll("{{event_name}}", eventName).replace(/[\r\n]+/g, " ").trim();
}

function feedbackContent(template: string, eventName: string, formUrl: string) {
  return template
    .replaceAll("{{event_name}}", escapeHtml(eventName))
    .replaceAll("{{form_url}}", escapeHtml(formUrl));
}

export async function createEventFeedbackCampaign(
  env: NewsletterEnv,
  event: FeedbackEventDetails,
) {
  const settings = await getEmailSettings(env);
  if (!settings.EVENT_FEEDBACK_ENABLED) return;

  const scheduledAt = feedbackDeliveryTime(
    event.endUtc,
    event.timezone,
    settings.EVENT_FEEDBACK_SEND_HOUR,
  );
  const formUrl = settings.EVENT_FEEDBACK_FORM_URL.replaceAll(
    "{{event_name}}",
    encodeURIComponent(event.name),
  );
  const bodyHtml = feedbackContent(settings.EVENT_FEEDBACK_BODY_HTML, event.name, formUrl);
  const now = new Date().toISOString();
  const db = requireDatabase(env);

  await db
    .prepare(
      `INSERT OR IGNORE INTO event_feedback_campaigns (
         id, eventbrite_event_id, event_name, event_timezone, subject, preview_text,
         body_html, body_text, status, scheduled_at, created_at, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'scheduled', ?9, ?10, ?10)`,
    )
    .bind(
      crypto.randomUUID(),
      event.id,
      event.name,
      event.timezone,
      renderTextTemplate(settings.EVENT_FEEDBACK_SUBJECT_TEMPLATE, event.name),
      renderTextTemplate(settings.EVENT_FEEDBACK_PREVIEW_TEXT, event.name),
      bodyHtml,
      htmlToText(bodyHtml),
      scheduledAt.toISOString(),
      now,
    )
    .run();
}

function eventbriteToken(env: NewsletterEnv) {
  const token = env.EVENTBRITE_API_TOKEN ?? env.EVENTBRITE_PRIVATE_TOKEN;
  if (!token) throw new Error("Eventbrite API token is not configured.");
  return token;
}

async function refreshFeedbackSchedule(env: NewsletterEnv, campaign: EventFeedbackCampaign) {
  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/${encodeURIComponent(campaign.eventbrite_event_id)}/`,
    { headers: { authorization: `Bearer ${eventbriteToken(env)}` } },
  );
  if (!response.ok) {
    throw new Error(`Eventbrite event fetch failed with status ${response.status}.`);
  }

  const event = (await response.json()) as EventbriteFeedbackEvent;
  if (event.id !== campaign.eventbrite_event_id) {
    throw new Error("Eventbrite returned a different event.");
  }
  if (env.EVENTBRITE_ORGANIZER_ID && event.organizer_id !== env.EVENTBRITE_ORGANIZER_ID) {
    throw new Error("Eventbrite event does not belong to the configured organizer.");
  }

  const db = requireDatabase(env);
  if (event.status === "canceled" || event.status === "cancelled") {
    await db
      .prepare(
        `UPDATE event_feedback_campaigns SET status = 'cancelled', updated_at = ?2
         WHERE id = ?1 AND status = 'sending'`,
      )
      .bind(campaign.id, new Date().toISOString())
      .run();
    return false;
  }

  if (!event.end?.utc) throw new Error("Eventbrite event end time is missing.");
  const timeZone = event.end.timezone ?? event.start?.timezone ?? campaign.event_timezone;
  const settings = await getEmailSettings(env);
  const scheduledAt = feedbackDeliveryTime(
    event.end.utc,
    timeZone,
    settings.EVENT_FEEDBACK_SEND_HOUR,
  );
  if (scheduledAt.getTime() > Date.now() + 30_000) {
    await db
      .prepare(
        `UPDATE event_feedback_campaigns
         SET status = 'scheduled', event_timezone = ?2, scheduled_at = ?3, updated_at = ?4
         WHERE id = ?1 AND status = 'sending'`,
      )
      .bind(campaign.id, timeZone, scheduledAt.toISOString(), new Date().toISOString())
      .run();
    return false;
  }

  return true;
}

async function fetchCheckedInAttendees(env: NewsletterEnv, eventId: string) {
  const token = eventbriteToken(env);
  const recipients = new Map<string, string>();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(
      `https://www.eventbriteapi.com/v3/events/${encodeURIComponent(eventId)}/attendees/`,
    );
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "100");

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Eventbrite attendee fetch failed with status ${response.status}.`);
    }

    const result = (await response.json()) as EventbriteAttendeePage;
    for (const attendee of result.attendees ?? []) {
      const email = normalizeEmail(attendee.profile?.email);
      if (
        attendee.id &&
        attendee.checked_in === true &&
        attendee.cancelled !== true &&
        attendee.refunded !== true &&
        attendee.refunded !== "full" &&
        isValidEmail(email) &&
        !recipients.has(email)
      ) {
        recipients.set(email, attendee.id);
      }
    }

    const pagination = result.pagination;
    hasMore = Boolean(
      pagination?.has_more_items ??
      pagination?.has_more ??
      (pagination?.page_number && pagination?.page_count
        ? pagination.page_number < pagination.page_count
        : false),
    );
    page += 1;
    if (page > 1000) throw new Error("Eventbrite attendee pagination exceeded its safety limit.");
  }

  return recipients;
}

async function createFeedbackDeliveries(env: NewsletterEnv, campaign: EventFeedbackCampaign) {
  const recipients = await fetchCheckedInAttendees(env, campaign.eventbrite_event_id);
  if (!recipients.size) return;

  const db = requireDatabase(env);
  const now = new Date().toISOString();
  const statements = [...recipients].map(([email, attendeeId]) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO event_feedback_deliveries (
           id, campaign_id, eventbrite_attendee_id, recipient_email, status, created_at, updated_at
         )
         SELECT ?1, ?2, ?3, ?4, 'queued', ?5, ?5
         WHERE NOT EXISTS (
           SELECT 1 FROM event_feedback_suppressions WHERE email = ?4
         )`,
      )
      .bind(crypto.randomUUID(), campaign.id, attendeeId, email, now),
  );

  for (let index = 0; index < statements.length; index += 50) {
    await db.batch(statements.slice(index, index + 50));
  }
}

async function completeFeedbackCampaignIfFinished(env: NewsletterEnv, campaignId: string) {
  const db = requireDatabase(env);
  const remaining = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM event_feedback_deliveries
       WHERE campaign_id = ?1 AND status IN ('queued', 'sending')`,
    )
    .bind(campaignId)
    .first<{ count: number }>();

  if ((remaining?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE event_feedback_campaigns
         SET status = 'sent', sent_at = COALESCE(sent_at, ?2), updated_at = ?2
         WHERE id = ?1 AND status = 'sending'`,
      )
      .bind(campaignId, now)
      .run();
  }
}

export async function dispatchEventFeedback(
  env: NewsletterEnv,
  campaignId: string,
  cursor?: string,
) {
  if (!env.NEWSLETTER_QUEUE) throw new Error("Newsletter Queue binding is not configured.");
  const db = requireDatabase(env);
  const campaign = await db
    .prepare(
      `SELECT id, eventbrite_event_id, event_name, event_timezone, subject, preview_text,
              body_html, body_text, status, scheduled_at, created_at, updated_at, sent_at
       FROM event_feedback_campaigns WHERE id = ?1`,
    )
    .bind(campaignId)
    .first<EventFeedbackCampaign>();
  if (!campaign || campaign.status !== "sending") return;

  if (!cursor) {
    if (!(await refreshFeedbackSchedule(env, campaign))) return;
    await createFeedbackDeliveries(env, campaign);
  }

  const deliveries = await db
    .prepare(
      `SELECT id FROM event_feedback_deliveries
       WHERE campaign_id = ?1 AND status = 'queued' AND id > ?2
       ORDER BY id ASC LIMIT 100`,
    )
    .bind(campaignId, cursor ?? "")
    .all<{ id: string }>();

  if (!deliveries.results.length) {
    await completeFeedbackCampaignIfFinished(env, campaignId);
    return;
  }

  await env.NEWSLETTER_QUEUE.sendBatch(
    deliveries.results.map((delivery) => ({
      body: { kind: "send-event-feedback-email", deliveryId: delivery.id },
    })),
  );

  const lastDelivery = deliveries.results.at(-1);
  if (deliveries.results.length === 100 && lastDelivery) {
    await env.NEWSLETTER_QUEUE.send({
      kind: "dispatch-event-feedback",
      campaignId,
      cursor: lastDelivery.id,
    });
  }
}

export async function sendEventFeedbackDelivery(env: NewsletterEnv, deliveryId: string) {
  const db = requireDatabase(env);
  const delivery = await db
    .prepare(
      `SELECT id, campaign_id, eventbrite_attendee_id, recipient_email, status, message_id
       FROM event_feedback_deliveries WHERE id = ?1`,
    )
    .bind(deliveryId)
    .first<EventFeedbackDelivery>();
  if (!delivery || ["sent", "delivered", "bounced", "complained"].includes(delivery.status)) return;

  const claimed = await db
    .prepare(
      `UPDATE event_feedback_deliveries SET status = 'sending', updated_at = ?2
       WHERE id = ?1 AND status IN ('queued', 'failed')`,
    )
    .bind(delivery.id, new Date().toISOString())
    .run();
  if (!claimed.meta.changes) return;

  const campaign = await db
    .prepare(
      `SELECT id, eventbrite_event_id, event_name, event_timezone, subject, preview_text,
              body_html, body_text, status, scheduled_at, created_at, updated_at, sent_at
       FROM event_feedback_campaigns WHERE id = ?1`,
    )
    .bind(delivery.campaign_id)
    .first<EventFeedbackCampaign>();

  if (!campaign) {
    await db
      .prepare(
        `UPDATE event_feedback_deliveries SET status = 'failed', error = ?2, updated_at = ?3
         WHERE id = ?1`,
      )
      .bind(delivery.id, "Feedback campaign was not found.", new Date().toISOString())
      .run();
    await completeFeedbackCampaignIfFinished(env, delivery.campaign_id);
    return;
  }

  const suppression = await db
    .prepare("SELECT reason FROM event_feedback_suppressions WHERE email = ?1")
    .bind(delivery.recipient_email)
    .first<{ reason: string }>();
  if (suppression) {
    await db
      .prepare(
        `UPDATE event_feedback_deliveries SET status = 'failed', error = ?2, updated_at = ?3
         WHERE id = ?1`,
      )
      .bind(delivery.id, `Recipient suppressed: ${suppression.reason}.`, new Date().toISOString())
      .run();
    await completeFeedbackCampaignIfFinished(env, delivery.campaign_id);
    return;
  }

  try {
    const unsubscribeToken = await createFeedbackUnsubscribeToken(delivery.recipient_email, env);
    const result = await sendEventFeedbackEmail({
      env,
      campaign,
      email: delivery.recipient_email,
      unsubscribeToken,
      deliveryId: delivery.id,
    });
    await db
      .prepare(
        `UPDATE event_feedback_deliveries
         SET status = 'sent', message_id = ?2, error = NULL, updated_at = ?3
         WHERE id = ?1`,
      )
      .bind(delivery.id, result.messageId, new Date().toISOString())
      .run();
    await completeFeedbackCampaignIfFinished(env, delivery.campaign_id);
  } catch (error) {
    await db
      .prepare(
        `UPDATE event_feedback_deliveries SET status = 'failed', error = ?2, updated_at = ?3
         WHERE id = ?1`,
      )
      .bind(
        delivery.id,
        error instanceof Error ? error.message.slice(0, 1000) : "Unknown email sending error",
        new Date().toISOString(),
      )
      .run();
    await completeFeedbackCampaignIfFinished(env, delivery.campaign_id);
    throw error;
  }
}

export async function recordEventFeedbackEmailEvent(
  env: NewsletterEnv,
  event: EmailSendingEvent,
  deliveryStatus: string,
) {
  const db = requireDatabase(env);
  const updated = await db
    .prepare(
      `UPDATE event_feedback_deliveries SET status = ?2, updated_at = ?3
       WHERE message_id = ?1`,
    )
    .bind(event.payload.messageId, deliveryStatus, new Date().toISOString())
    .run();
  if (!updated.meta.changes) return false;

  const reason = event.type === "cf.email.sending.message.complained"
    ? "complained"
    : event.type === "cf.email.sending.message.bounced" && event.payload.bounce?.type === "hard"
      ? "bounced"
      : null;
  if (reason) {
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO event_feedback_suppressions (email, reason, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(email) DO UPDATE SET reason = excluded.reason, updated_at = excluded.updated_at`,
      )
      .bind(normalizeEmail(event.payload.recipient), reason, now)
      .run();
  }

  return true;
}

export async function dispatchDueEventFeedback(env: NewsletterEnv) {
  if (!env.NEWSLETTER_QUEUE || !env.NEWSLETTER_DB) return;
  const settings = await getEmailSettings(env);
  if (!settings.EVENT_FEEDBACK_ENABLED) return;

  const now = new Date().toISOString();
  const recoveryCutoff = new Date(Date.now() - 60_000).toISOString();
  const due = await env.NEWSLETTER_DB
    .prepare(
      `SELECT id, status FROM event_feedback_campaigns
       WHERE (status = 'scheduled' AND scheduled_at <= ?1)
          OR (status = 'sending' AND updated_at <= ?2 AND NOT EXISTS (
                SELECT 1 FROM event_feedback_deliveries
                WHERE campaign_id = event_feedback_campaigns.id
              ))
       ORDER BY scheduled_at ASC LIMIT 20`,
    )
    .bind(now, recoveryCutoff)
    .all<{ id: string; status: "scheduled" | "sending" }>();

  for (const campaign of due.results) {
    if (campaign.status === "scheduled") {
      const claimed = await env.NEWSLETTER_DB
        .prepare(
          `UPDATE event_feedback_campaigns SET status = 'sending', updated_at = ?2
           WHERE id = ?1 AND status = 'scheduled'`,
        )
        .bind(campaign.id, now)
        .run();
      if (!claimed.meta.changes) continue;
    }

    try {
      await env.NEWSLETTER_QUEUE.send({
        kind: "dispatch-event-feedback",
        campaignId: campaign.id,
      });
    } catch (error) {
      if (campaign.status === "scheduled") {
        await env.NEWSLETTER_DB
          .prepare(
            `UPDATE event_feedback_campaigns SET status = 'scheduled', updated_at = ?2
             WHERE id = ?1 AND status = 'sending'`,
          )
          .bind(campaign.id, new Date().toISOString())
          .run();
      }
      throw error;
    }
  }
}
