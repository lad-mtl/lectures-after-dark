import { getEmailSettings } from "./settings";
import { verifyTurnstile } from "./turnstile";

interface ContactEnv {
  EMAIL?: SendEmail;
  CONTACT_RATE_LIMITER?: RateLimit;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_CORE_EMAIL?: string;
  CONTACT_MARKETING_EMAIL?: string;
  CONTACT_REQUIRE_RATE_LIMIT?: string;
  CONTACT_REQUIRE_TURNSTILE?: string;
  NEWSLETTER_DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_HOSTNAMES?: string;
}

type ContactInquiryType = "general" | "partnerships";

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  subject?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
}

const GENERIC_CONTACT_MESSAGE = "Thanks. Your message has been sent.";

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeHeaderText(value: unknown) {
  return normalizeText(value).replace(/[\r\n]+/g, " ");
}

function normalizeInquiryType(value: unknown): ContactInquiryType {
  return value === "partnerships" ? "partnerships" : "general";
}

async function hashRateLimitKey(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isWithinContactRateLimit(request: Request, email: string, env: ContactEnv) {
  if (!env.CONTACT_RATE_LIMITER) {
    return env.CONTACT_REQUIRE_RATE_LIMIT !== "true";
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const emailHash = await hashRateLimitKey(email);
  const [ipOutcome, emailOutcome] = await Promise.all([
    env.CONTACT_RATE_LIMITER.limit({ key: `ip:${ip}` }),
    env.CONTACT_RATE_LIMITER.limit({ key: `email:${emailHash}` }),
  ]);

  return ipOutcome.success && emailOutcome.success;
}

function contactSender(configured: string): string | EmailAddress {
  const namedAddress = configured.match(/^(.+?)\s*<([^<>]+)>$/);
  if (!namedAddress) return configured;

  return {
    name: namedAddress[1].trim(),
    email: namedAddress[2].trim(),
  };
}

async function createContactSubmission(
  env: ContactEnv,
  payload: {
    name: string;
    email: string;
    inquiryType: ContactInquiryType;
    subject: string;
    message: string;
  },
) {
  if (!env.NEWSLETTER_DB) return null;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await env.NEWSLETTER_DB
      .prepare(
        `INSERT INTO contact_submissions (
           id, name, email, inquiry_type, subject, message, delivery_status, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', ?7, ?7)`,
      )
      .bind(id, payload.name, payload.email, payload.inquiryType, payload.subject, payload.message, now)
      .run();
    return id;
  } catch (error) {
    console.error("Unable to record contact form submission", error);
    return null;
  }
}

async function updateContactDelivery(
  env: ContactEnv,
  id: string | null,
  status: "sent" | "failed",
  error?: unknown,
) {
  if (!id || !env.NEWSLETTER_DB) return;
  try {
    await env.NEWSLETTER_DB
      .prepare(
        `UPDATE contact_submissions
         SET delivery_status = ?2, error = ?3, updated_at = ?4 WHERE id = ?1`,
      )
      .bind(
        id,
        status,
        error instanceof Error ? error.message.slice(0, 1000) : error ? "Unknown email sending error" : null,
        new Date().toISOString(),
      )
      .run();
  } catch (updateError) {
    console.error("Unable to update contact submission delivery", updateError);
  }
}

function buildEmailText(payload: {
  name: string;
  email: string;
  inquiryType: ContactInquiryType;
  subject: string;
  message: string;
}) {
  return [
    "New contact form submission",
    "",
    `Inquiry Type: ${payload.inquiryType === "partnerships" ? "Partnerships" : "General Inquiries"}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function buildEmailHtml(payload: {
  name: string;
  email: string;
  inquiryType: ContactInquiryType;
  subject: string;
  message: string;
}) {
  return `
    <h1>New contact form submission</h1>
    <p><strong>Inquiry Type:</strong> ${payload.inquiryType === "partnerships" ? "Partnerships" : "General Inquiries"}</p>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
    <h2>Message</h2>
    <p>${escapeHtml(payload.message).replaceAll("\n", "<br />")}</p>
  `;
}

export async function handleContactRequest(request: Request, env: ContactEnv) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/contact") {
    return null;
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (!env.EMAIL) {
    return jsonResponse({ error: "Contact form email service is not configured." }, 500);
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return jsonResponse({ success: true, message: GENERIC_CONTACT_MESSAGE }, 202);
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const inquiryType = normalizeInquiryType(payload.inquiryType);
  const subject = normalizeHeaderText(payload.subject);
  const message = normalizeText(payload.message);

  if (!name || !email || !subject || !message) {
    return jsonResponse({ error: "All fields are required." }, 400);
  }

  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Please enter a valid email address." }, 400);
  }

  if (name.length > 120 || subject.length > 200 || message.length > 5000) {
    return jsonResponse({ error: "One or more fields exceed the allowed length." }, 400);
  }

  if (
    !(await verifyTurnstile(
      request,
      payload.turnstileToken,
      env,
      "contact",
      env.CONTACT_REQUIRE_TURNSTILE === "true",
    ))
  ) {
    return jsonResponse({ error: "Please complete the security check." }, 400);
  }

  if (!(await isWithinContactRateLimit(request, email, env))) {
    if (!env.CONTACT_RATE_LIMITER && env.CONTACT_REQUIRE_RATE_LIMIT === "true") {
      return jsonResponse({ error: "Contact form protection is not configured." }, 503);
    }

    return jsonResponse(
      { error: "Too many messages have been sent. Please wait a minute and try again." },
      429,
      { "retry-after": "60" },
    );
  }

  const settings = await getEmailSettings(env);
  const to = inquiryType === "partnerships"
    ? settings.CONTACT_MARKETING_EMAIL
    : settings.CONTACT_CORE_EMAIL;
  const submissionId = await createContactSubmission(env, {
    name,
    email,
    inquiryType,
    subject,
    message,
  });

  try {
    await env.EMAIL.send({
      from: contactSender(settings.CONTACT_FROM_EMAIL),
      to,
      replyTo: email,
      subject: `[${settings.CONTACT_SUBJECT_PREFIX}] ${subject}`,
      html: buildEmailHtml({ name, email, inquiryType, subject, message }),
      text: buildEmailText({ name, email, inquiryType, subject, message }),
    });
    await updateContactDelivery(env, submissionId, "sent");
  } catch (error) {
    await updateContactDelivery(env, submissionId, "failed", error);
    console.error("Cloudflare Email Sending contact failure", error);
    return jsonResponse({ error: "Unable to send your message right now." }, 502);
  }

  return jsonResponse({ success: true });
}
