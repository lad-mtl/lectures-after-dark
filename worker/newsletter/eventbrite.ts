import { createEventFeedbackCampaign } from "./feedback";
import type { NewsletterEnv, NewsletterQueueMessage } from "./types";
import {
  escapeHtml,
  htmlToText,
  jsonResponse,
  normalizeText,
  requireDatabase,
  sha256,
} from "./utils";

interface EventbriteWebhookPayload {
  api_url?: unknown;
  config?: {
    action?: unknown;
  };
}

export interface EventbriteEvent {
  id?: string;
  organizer_id?: string;
  status?: string;
  name?: { text?: string };
  description?: { text?: string };
  start?: { local?: string; utc?: string; timezone?: string };
  end?: { local?: string; utc?: string; timezone?: string };
  url?: string;
  logo?: { original?: { url?: string }; url?: string } | null;
  venue?: {
    name?: string;
    address?: {
      localized_address_display?: string;
    };
  } | null;
  ticket_availability?: {
    minimum_ticket_price?: {
      display?: string;
    } | null;
  };
}

function extractEventId(apiUrl: unknown) {
  if (typeof apiUrl !== "string") return null;

  try {
    const url = new URL(apiUrl);
    if (url.hostname !== "www.eventbriteapi.com" && url.hostname !== "www.eventbrite.com") {
      return null;
    }
    return url.pathname.match(/\/events\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

function secretMatches(supplied: string, expected: string) {
  const suppliedBytes = new TextEncoder().encode(supplied);
  const expectedBytes = new TextEncoder().encode(expected);
  if (suppliedBytes.byteLength !== expectedBytes.byteLength) return false;

  let difference = 0;
  for (let index = 0; index < suppliedBytes.byteLength; index += 1) {
    difference |= suppliedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

export async function handleEventbriteWebhook(request: Request, env: NewsletterEnv) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/webhooks/eventbrite/")) return null;
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  if (!env.EVENTBRITE_WEBHOOK_SECRET || !env.NEWSLETTER_QUEUE) {
    return jsonResponse({ error: "Eventbrite webhook is not configured." }, 503);
  }

  let suppliedSecret: string;
  try {
    suppliedSecret = decodeURIComponent(url.pathname.slice("/api/webhooks/eventbrite/".length));
  } catch {
    return jsonResponse({ error: "Not found." }, 404);
  }
  if (!secretMatches(suppliedSecret, env.EVENTBRITE_WEBHOOK_SECRET)) {
    return jsonResponse({ error: "Not found." }, 404);
  }

  let payload: EventbriteWebhookPayload;
  try {
    payload = (await request.json()) as EventbriteWebhookPayload;
  } catch {
    return jsonResponse({ error: "Invalid webhook payload." }, 400);
  }

  const action = normalizeText(payload.config?.action, 80);
  if (action !== "event.published") {
    return jsonResponse({ accepted: true, ignored: true }, 202);
  }

  const eventId = extractEventId(payload.api_url);
  if (!eventId) return jsonResponse({ error: "Event ID is missing." }, 400);

  const db = requireDatabase(env);
  const webhookEventId = await sha256(`${action}:${eventId}`);
  const insert = await db
    .prepare(
      `INSERT OR IGNORE INTO newsletter_webhook_events (
         id, provider, external_event_id, action, received_at
       ) VALUES (?1, 'eventbrite', ?2, ?3, ?4)`,
    )
    .bind(webhookEventId, eventId, action, new Date().toISOString())
    .run();

  if (!insert.meta.changes) {
    const existingEvent = await db
      .prepare("SELECT processed_at FROM newsletter_webhook_events WHERE id = ?1")
      .bind(webhookEventId)
      .first<{ processed_at: string | null }>();
    if (existingEvent?.processed_at) {
      return jsonResponse({ accepted: true, duplicate: true }, 202);
    }
  }

  const message: NewsletterQueueMessage = {
    kind: "eventbrite-published",
    eventId,
    webhookEventId,
  };
  await env.NEWSLETTER_QUEUE.send(message);

  return jsonResponse({ accepted: true }, 202);
}

function formatEventDate(value: string | undefined, timezone: string | undefined) {
  if (!value) return "Date and time available on Eventbrite";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat("en-CA", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  }
}

function eventAnnouncementHtml(event: EventbriteEvent) {
  const title = event.name?.text?.trim() || "A new Lectures After Dark event";
  const description = event.description?.text?.trim().slice(0, 1200) || "Join us for our next lecture night.";
  const eventUrl = event.url || "https://lecturesafterdark.ca";
  const imageUrl = event.logo?.original?.url || event.logo?.url;
  const venue = event.venue?.name || event.venue?.address?.localized_address_display || "Venue details on Eventbrite";
  const address = event.venue?.address?.localized_address_display;
  const price = event.ticket_availability?.minimum_ticket_price?.display;
  const date = formatEventDate(event.start?.utc ?? event.start?.local, event.start?.timezone);

  return `
    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="width:100%;margin:0 0 26px;">` : ""}
    <p style="margin:0 0 10px;color:#ff8833;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Just announced</p>
    <h1 style="margin:0 0 18px;font-size:34px;">${escapeHtml(title)}</h1>
    <p><strong style="color:#f5f0e8;">${escapeHtml(date)}</strong><br>${escapeHtml(venue)}${address && address !== venue ? `<br>${escapeHtml(address)}` : ""}${price ? `<br>Tickets from ${escapeHtml(price)}` : ""}</p>
    <p>${escapeHtml(description).replaceAll("\n", "<br>")}</p>
    <p style="margin:30px 0;text-align:center;"><a href="${escapeHtml(eventUrl)}" style="display:inline-block;background:#ff6f00;color:#1a1612;padding:15px 26px;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">View event &amp; get tickets</a></p>`;
}

export async function fetchEventbriteEvent(env: NewsletterEnv, eventId: string) {
  const eventbriteToken = env.EVENTBRITE_API_TOKEN ?? env.EVENTBRITE_PRIVATE_TOKEN;
  if (!eventbriteToken) throw new Error("Eventbrite API token is not configured.");

  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/${encodeURIComponent(eventId)}/?expand=venue,logo,ticket_availability`,
    { headers: { authorization: `Bearer ${eventbriteToken}` } },
  );
  if (!response.ok) {
    throw new Error(`Eventbrite event fetch failed with status ${response.status}.`);
  }

  return (await response.json()) as EventbriteEvent;
}

function feedbackDetails(event: EventbriteEvent, eventId: string) {
  const endUtc = event.end?.utc;
  if (!endUtc) throw new Error("Eventbrite event end time is missing.");

  return {
    id: eventId,
    name: event.name?.text?.trim() || "Lectures After Dark",
    endUtc,
    timezone: event.end?.timezone ?? event.start?.timezone ?? "America/Toronto",
  };
}

export async function createFeedbackCampaignForEventId(env: NewsletterEnv, eventId: string) {
  const event = await fetchEventbriteEvent(env, eventId);
  if (event.id !== eventId) throw new Error("Eventbrite returned a different event.");
  if (env.EVENTBRITE_ORGANIZER_ID && event.organizer_id !== env.EVENTBRITE_ORGANIZER_ID) {
    throw new Error("Eventbrite event does not belong to the configured organizer.");
  }

  await createEventFeedbackCampaign(env, feedbackDetails(event, eventId));
}

export async function createCampaignFromEventbrite(options: {
  env: NewsletterEnv;
  eventId: string;
  webhookEventId: string;
}) {
  const { env, eventId, webhookEventId } = options;
  const event = await fetchEventbriteEvent(env, eventId);
  if (event.id !== eventId || event.status !== "live") {
    throw new Error("Eventbrite event is not a live matching event.");
  }
  if (env.EVENTBRITE_ORGANIZER_ID && event.organizer_id !== env.EVENTBRITE_ORGANIZER_ID) {
    throw new Error("Eventbrite event does not belong to the configured organizer.");
  }

  const bodyHtml = eventAnnouncementHtml(event);
  const title = event.name?.text?.trim() || "New event";
  const delayMinutes = Math.max(1, Number(env.EVENTBRITE_SEND_DELAY_MINUTES ?? "10") || 10);
  const now = new Date();
  const scheduledAt = new Date(now.getTime() + delayMinutes * 60 * 1000).toISOString();
  const campaignId = crypto.randomUUID();
  const db = requireDatabase(env);

  await db
    .prepare(
      `INSERT OR IGNORE INTO newsletter_campaigns (
         id, eventbrite_event_id, name, subject, preview_text, body_html, body_text,
         status, scheduled_at, created_by, created_at, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'scheduled', ?8, 'eventbrite-webhook', ?9, ?9)`,
    )
    .bind(
      campaignId,
      eventId,
      `Eventbrite: ${title}`,
      `Just announced: ${title}`,
      `${title} is now live on Eventbrite.`,
      bodyHtml,
      htmlToText(bodyHtml),
      scheduledAt,
      now.toISOString(),
    )
    .run();

  await createEventFeedbackCampaign(env, feedbackDetails(event, eventId));

  await db
    .prepare(
      `UPDATE newsletter_webhook_events
       SET processed_at = ?2, error = NULL WHERE id = ?1`,
    )
    .bind(webhookEventId, new Date().toISOString())
    .run();
}

export async function recordEventbriteWebhookError(
  env: NewsletterEnv,
  webhookEventId: string,
  error: unknown,
) {
  const db = requireDatabase(env);
  await db
    .prepare("UPDATE newsletter_webhook_events SET error = ?2 WHERE id = ?1")
    .bind(webhookEventId, error instanceof Error ? error.message.slice(0, 1000) : "Unknown error")
    .run();
}
