import { verifyTurnstile } from "../turnstile";
import { sendCampaignEmail, sendConfirmationEmail } from "./email";
import type {
  NewsletterCampaign,
  NewsletterEnv,
  NewsletterQueueMessage,
  NewsletterSubscriber,
} from "./types";
import {
  createUnsubscribeToken,
  getAdminEmail,
  getSiteUrl,
  htmlToText,
  isSameOriginRequest,
  isValidEmail,
  jsonResponse,
  normalizeEmail,
  normalizeText,
  randomToken,
  requireDatabase,
  sanitizeEmailHtml,
  sha256,
  verifyUnsubscribeToken,
} from "./utils";

interface SubscribePayload {
  email?: unknown;
  source?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
}

interface CampaignPayload {
  name?: unknown;
  subject?: unknown;
  previewText?: unknown;
  bodyHtml?: unknown;
  scheduledAt?: unknown;
}

const GENERIC_SUBSCRIBE_MESSAGE =
  "If that address can be subscribed, a confirmation email is on its way.";

async function readJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

async function handleSubscribe(
  request: Request,
  env: NewsletterEnv,
  ctx: ExecutionContext,
) {
  const payload = await readJson<SubscribePayload>(request);
  if (!payload) return jsonResponse({ error: "Invalid JSON payload." }, 400);

  if (typeof payload.website === "string" && payload.website.trim()) {
    return jsonResponse({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE }, 202);
  }

  if (
    !(await verifyTurnstile(
      request,
      payload.turnstileToken,
      env,
      "newsletter",
      env.NEWSLETTER_REQUIRE_TURNSTILE === "true",
    ))
  ) {
    return jsonResponse({ error: "Please complete the security check." }, 400);
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Please enter a valid email address." }, 400);
  }

  if (!env.EMAIL && !env.NEWSLETTER_QUEUE) {
    return jsonResponse({ error: "Newsletter email service is not configured." }, 503);
  }

  const db = requireDatabase(env);
  const existing = await db
    .prepare(
      `SELECT id, email, status, confirmation_token_hash, confirmation_expires_at
       FROM newsletter_subscribers WHERE email = ?1`,
    )
    .bind(email)
    .first<NewsletterSubscriber>();

  if (existing?.status === "subscribed") {
    return jsonResponse({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE }, 202);
  }

  const now = new Date();
  const proposedSubscriberId = existing?.id ?? crypto.randomUUID();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const source = normalizeText(payload.source, 80) || "website";

  const savedSubscriber = await db
    .prepare(
      `INSERT INTO newsletter_subscribers (
         id, email, status, source, consent_version, confirmation_token_hash,
         confirmation_expires_at, created_at, updated_at
       ) VALUES (?1, ?2, 'pending', ?3, '2026-01', ?4, ?5, ?6, ?6)
       ON CONFLICT(email) DO UPDATE SET
         status = 'pending', source = excluded.source,
         confirmation_token_hash = excluded.confirmation_token_hash,
         confirmation_expires_at = excluded.confirmation_expires_at,
         updated_at = excluded.updated_at
       RETURNING id`,
    )
    .bind(proposedSubscriberId, email, source, tokenHash, expiresAt, now.toISOString())
    .first<{ id: string }>();
  if (!savedSubscriber) throw new Error("Unable to save newsletter subscriber.");

  const message: NewsletterQueueMessage = {
    kind: "send-confirmation",
    subscriberId: savedSubscriber.id,
    token,
  };

  if (env.NEWSLETTER_QUEUE) {
    await env.NEWSLETTER_QUEUE.send(message);
  } else {
    ctx.waitUntil(sendConfirmationEmail(env, email, token));
  }

  return jsonResponse({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE }, 202);
}

async function handleConfirmation(request: Request, env: NewsletterEnv) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const stateUrl = new URL("/newsletter", getSiteUrl(env));
  if (!token) {
    stateUrl.searchParams.set("state", "invalid");
    return Response.redirect(stateUrl.toString(), 303);
  }

  const db = requireDatabase(env);
  const tokenHash = await sha256(token);
  const subscriber = await db
    .prepare(
      `SELECT id, email, status, confirmation_token_hash, confirmation_expires_at
       FROM newsletter_subscribers
       WHERE confirmation_token_hash = ?1`,
    )
    .bind(tokenHash)
    .first<NewsletterSubscriber>();

  if (
    !subscriber ||
    !subscriber.confirmation_expires_at ||
    new Date(subscriber.confirmation_expires_at).getTime() < Date.now()
  ) {
    stateUrl.searchParams.set("state", "invalid");
    return Response.redirect(stateUrl.toString(), 303);
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE newsletter_subscribers
       SET status = 'subscribed', consented_at = COALESCE(consented_at, ?2),
           confirmation_token_hash = NULL, confirmation_expires_at = NULL, updated_at = ?2
       WHERE id = ?1`,
    )
    .bind(subscriber.id, now)
    .run();

  stateUrl.searchParams.set("state", "confirmed");
  return Response.redirect(stateUrl.toString(), 303);
}

async function handleUnsubscribe(request: Request, env: NewsletterEnv) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") ?? "";

  if (request.method === "POST" && request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    token = typeof form.get("token") === "string" ? String(form.get("token")) : token;
  }

  const subscriberId = await verifyUnsubscribeToken(token, env);
  let subscriberMatched = false;
  if (subscriberId) {
    const db = requireDatabase(env);
    const result = await db
      .prepare(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed', updated_at = ?2
         WHERE id = ?1`,
      )
      .bind(subscriberId, new Date().toISOString())
      .run();
    subscriberMatched = result.meta.changes > 0;
  }

  if (request.method === "POST") {
    return jsonResponse({ success: true });
  }

  const stateUrl = new URL("/newsletter", getSiteUrl(env));
  stateUrl.searchParams.set("state", subscriberMatched ? "unsubscribed" : "invalid");
  return Response.redirect(stateUrl.toString(), 303);
}

function parseCampaign(payload: CampaignPayload) {
  const name = normalizeText(payload.name, 160);
  const subject = normalizeText(payload.subject, 200);
  const previewText = normalizeText(payload.previewText, 240);
  const bodyHtml = sanitizeEmailHtml(normalizeText(payload.bodyHtml, 200_000));
  if (!name || !subject || !bodyHtml) return null;

  return {
    name,
    subject,
    previewText,
    bodyHtml,
    bodyText: htmlToText(bodyHtml),
  };
}

async function listCampaigns(env: NewsletterEnv, adminEmail: string) {
  const db = requireDatabase(env);
  const campaigns = await db
    .prepare(
      `SELECT id, eventbrite_event_id, name, subject, preview_text, body_html, body_text,
              status, scheduled_at, created_by, created_at, updated_at, sent_at
       FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 100`,
    )
    .all<NewsletterCampaign>();
  const subscriberCount = await db
    .prepare("SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE status = 'subscribed'")
    .first<{ count: number }>();

  return jsonResponse({
    adminEmail,
    subscriberCount: subscriberCount?.count ?? 0,
    campaigns: campaigns.results,
  });
}

async function createCampaign(request: Request, env: NewsletterEnv, adminEmail: string) {
  const payload = await readJson<CampaignPayload>(request);
  const campaign = payload ? parseCampaign(payload) : null;
  if (!campaign) return jsonResponse({ error: "Name, subject, and content are required." }, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const db = requireDatabase(env);
  await db
    .prepare(
      `INSERT INTO newsletter_campaigns (
         id, name, subject, preview_text, body_html, body_text, status,
         created_by, created_at, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'draft', ?7, ?8, ?8)`,
    )
    .bind(
      id,
      campaign.name,
      campaign.subject,
      campaign.previewText,
      campaign.bodyHtml,
      campaign.bodyText,
      adminEmail,
      now,
    )
    .run();

  return jsonResponse({ success: true, id }, 201);
}

async function updateCampaign(
  request: Request,
  env: NewsletterEnv,
  campaignId: string,
) {
  const payload = await readJson<CampaignPayload>(request);
  const campaign = payload ? parseCampaign(payload) : null;
  if (!campaign) return jsonResponse({ error: "Name, subject, and content are required." }, 400);

  const db = requireDatabase(env);
  const result = await db
    .prepare(
      `UPDATE newsletter_campaigns
       SET name = ?2, subject = ?3, preview_text = ?4, body_html = ?5,
           body_text = ?6, updated_at = ?7
       WHERE id = ?1 AND status IN ('draft', 'scheduled')`,
    )
    .bind(
      campaignId,
      campaign.name,
      campaign.subject,
      campaign.previewText,
      campaign.bodyHtml,
      campaign.bodyText,
      new Date().toISOString(),
    )
    .run();

  if (!result.meta.changes) {
    return jsonResponse({ error: "Campaign is no longer editable." }, 409);
  }

  return jsonResponse({ success: true });
}

async function deleteCampaign(env: NewsletterEnv, campaignId: string) {
  const db = requireDatabase(env);
  const result = await db
    .prepare(
      `DELETE FROM newsletter_campaigns
       WHERE id = ?1 AND status IN ('draft', 'cancelled')`,
    )
    .bind(campaignId)
    .run();

  if (!result.meta.changes) {
    return jsonResponse({ error: "Only draft or cancelled campaigns can be deleted." }, 409);
  }

  return jsonResponse({ success: true });
}

async function scheduleCampaign(request: Request, env: NewsletterEnv, campaignId: string) {
  const payload = await readJson<CampaignPayload>(request);
  const suppliedDate = normalizeText(payload?.scheduledAt, 80);
  const delayMinutes = Math.max(1, Number(env.EVENTBRITE_SEND_DELAY_MINUTES ?? "10") || 10);
  const scheduledAt = suppliedDate
    ? new Date(suppliedDate)
    : new Date(Date.now() + delayMinutes * 60 * 1000);

  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 30_000) {
    return jsonResponse({ error: "Choose a valid future delivery time." }, 400);
  }

  const db = requireDatabase(env);
  const result = await db
    .prepare(
      `UPDATE newsletter_campaigns
       SET status = 'scheduled', scheduled_at = ?2, updated_at = ?3
       WHERE id = ?1 AND status IN ('draft', 'scheduled')`,
    )
    .bind(campaignId, scheduledAt.toISOString(), new Date().toISOString())
    .run();

  if (!result.meta.changes) {
    return jsonResponse({ error: "Campaign cannot be scheduled." }, 409);
  }

  return jsonResponse({ success: true, scheduledAt: scheduledAt.toISOString() });
}

async function cancelCampaign(env: NewsletterEnv, campaignId: string) {
  const db = requireDatabase(env);
  const result = await db
    .prepare(
      `UPDATE newsletter_campaigns
       SET status = 'cancelled', updated_at = ?2
       WHERE id = ?1 AND status = 'scheduled'`,
    )
    .bind(campaignId, new Date().toISOString())
    .run();

  if (!result.meta.changes) {
    return jsonResponse({ error: "Only scheduled campaigns can be cancelled." }, 409);
  }

  return jsonResponse({ success: true });
}

async function sendTestCampaign(
  request: Request,
  env: NewsletterEnv,
  campaignId: string,
) {
  const payload = await readJson<{ email?: unknown }>(request);
  const email = normalizeEmail(payload?.email);
  if (!isValidEmail(email)) return jsonResponse({ error: "Enter a valid test address." }, 400);

  const db = requireDatabase(env);
  const campaign = await db
    .prepare(
      `SELECT id, eventbrite_event_id, name, subject, preview_text, body_html, body_text,
              status, scheduled_at, created_by, created_at, updated_at, sent_at
       FROM newsletter_campaigns WHERE id = ?1`,
    )
    .bind(campaignId)
    .first<NewsletterCampaign>();
  if (!campaign) return jsonResponse({ error: "Campaign not found." }, 404);

  const subscriber = await db
    .prepare("SELECT id FROM newsletter_subscribers WHERE email = ?1 AND status = 'subscribed'")
    .bind(email)
    .first<{ id: string }>();
  const unsubscribeToken = subscriber
    ? await createUnsubscribeToken(subscriber.id, env)
    : undefined;
  await sendCampaignEmail({
    env,
    campaign,
    email,
    unsubscribeToken,
    deliveryId: `test-${crypto.randomUUID()}`,
  });

  return jsonResponse({ success: true });
}

async function uploadAsset(request: Request, env: NewsletterEnv) {
  if (!env.NEWSLETTER_ASSETS || !env.NEWSLETTER_ASSET_BASE_URL) {
    return jsonResponse({ error: "Newsletter R2 asset storage is not configured." }, 503);
  }

  const form = await request.formData();
  const asset = form.get("asset");
  if (!(asset instanceof File)) return jsonResponse({ error: "Choose an image to upload." }, 400);
  const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);
  if (!allowedImageTypes.has(asset.type) || asset.size > 5 * 1024 * 1024) {
    return jsonResponse({ error: "Use a JPEG, PNG, GIF, WebP, or AVIF image up to 5 MB." }, 400);
  }

  const extension = asset.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const key = `newsletter/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  await env.NEWSLETTER_ASSETS.put(key, await asset.arrayBuffer(), {
    httpMetadata: { contentType: asset.type, cacheControl: "public, max-age=31536000, immutable" },
  });

  const baseUrl = env.NEWSLETTER_ASSET_BASE_URL.replace(/\/$/, "");
  return jsonResponse({ success: true, url: `${baseUrl}/${key}` }, 201);
}

async function handleAdminRequest(request: Request, env: NewsletterEnv) {
  const adminEmail = getAdminEmail(request, env);
  if (!adminEmail) return jsonResponse({ error: "Cloudflare Access authorization required." }, 403);
  if (request.method !== "GET" && !isSameOriginRequest(request, env)) {
    return jsonResponse({ error: "Cross-origin admin requests are not allowed." }, 403);
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const campaignIndex = segments.indexOf("campaigns");
  const campaignId = campaignIndex >= 0 ? segments[campaignIndex + 1] : undefined;
  const action = campaignIndex >= 0 ? segments[campaignIndex + 2] : undefined;

  if (url.pathname === "/api/newsletter/admin/campaigns" && request.method === "GET") {
    return listCampaigns(env, adminEmail);
  }
  if (url.pathname === "/api/newsletter/admin/campaigns" && request.method === "POST") {
    return createCampaign(request, env, adminEmail);
  }
  if (url.pathname === "/api/newsletter/admin/assets" && request.method === "POST") {
    return uploadAsset(request, env);
  }
  if (campaignId && !action && request.method === "PUT") {
    return updateCampaign(request, env, campaignId);
  }
  if (campaignId && !action && request.method === "DELETE") {
    return deleteCampaign(env, campaignId);
  }
  if (campaignId && action === "schedule" && request.method === "POST") {
    return scheduleCampaign(request, env, campaignId);
  }
  if (campaignId && action === "cancel" && request.method === "POST") {
    return cancelCampaign(env, campaignId);
  }
  if (campaignId && action === "test" && request.method === "POST") {
    return sendTestCampaign(request, env, campaignId);
  }

  return jsonResponse({ error: "Newsletter admin route not found." }, 404);
}

export async function handleNewsletterRequest(
  request: Request,
  env: NewsletterEnv,
  ctx: ExecutionContext,
) {
  const url = new URL(request.url);

  try {
    if (url.pathname === "/api/newsletter/subscribe" && request.method === "POST") {
      return await handleSubscribe(request, env, ctx);
    }
    if (url.pathname === "/api/newsletter/confirm" && request.method === "GET") {
      return await handleConfirmation(request, env);
    }
    if (
      url.pathname === "/api/newsletter/unsubscribe" &&
      (request.method === "GET" || request.method === "POST")
    ) {
      return await handleUnsubscribe(request, env);
    }
    if (url.pathname.startsWith("/api/newsletter/admin/")) {
      return await handleAdminRequest(request, env);
    }
  } catch (error) {
    console.error("Newsletter request failed", error);
    return jsonResponse({ error: "Unable to process the newsletter request right now." }, 500);
  }

  return null;
}
