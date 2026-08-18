import type { NewsletterEnv } from "./types";

const encoder = new TextEncoder();

export function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export function requireDatabase(env: NewsletterEnv) {
  if (!env.NEWSLETTER_DB) {
    throw new Error("Newsletter D1 binding is not configured.");
  }

  return env.NEWSLETTER_DB;
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeEmailHtml(value: string) {
  return value
    .slice(0, 200_000)
    .replace(/<(script|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed|form|input|button)\b[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*(javascript:|data:text\/html)[\s\S]*?\2/gi, '$1="#"');
}

export function htmlToText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/h[1-6]>|<\/li>|<\/blockquote>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createUnsubscribeToken(subscriberId: string, env: NewsletterEnv) {
  if (!env.NEWSLETTER_TOKEN_SECRET) {
    throw new Error("Newsletter token secret is not configured.");
  }

  const payload = bytesToBase64Url(encoder.encode(subscriberId));
  return `${payload}.${await hmac(payload, env.NEWSLETTER_TOKEN_SECRET)}`;
}

export async function verifyUnsubscribeToken(token: string, env: NewsletterEnv) {
  if (!env.NEWSLETTER_TOKEN_SECRET) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;

  const expectedSignature = await hmac(payload, env.NEWSLETTER_TOKEN_SECRET);
  const suppliedBytes = encoder.encode(suppliedSignature);
  const expectedBytes = encoder.encode(expectedSignature);
  if (suppliedBytes.byteLength !== expectedBytes.byteLength) return null;

  let difference = 0;
  for (let index = 0; index < suppliedBytes.byteLength; index += 1) {
    difference |= suppliedBytes[index] ^ expectedBytes[index];
  }
  if (difference !== 0) return null;

  try {
    return new TextDecoder().decode(base64UrlToBytes(payload));
  } catch {
    return null;
  }
}

export function getSiteUrl(env: NewsletterEnv) {
  return (env.SITE_URL ?? "https://lecturesafterdark.ca").replace(/\/$/, "");
}

export function isSameOriginRequest(request: Request, env: NewsletterEnv) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const suppliedOrigin = request.headers.get("origin");
  if (!suppliedOrigin) return true;

  const requestOrigin = new URL(request.url).origin;
  const siteOrigin = new URL(getSiteUrl(env)).origin;
  return suppliedOrigin === requestOrigin || suppliedOrigin === siteOrigin;
}

export function getAdminEmail(request: Request, env: NewsletterEnv) {
  const url = new URL(request.url);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isLocal && env.NEWSLETTER_ALLOW_LOCAL_ADMIN === "true") {
    return "local-admin@lecturesafterdark.ca";
  }

  const email = request.headers.get("cf-access-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return null;

  const allowed = (env.NEWSLETTER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email) ? email : null;
}

export async function verifyTurnstile(
  request: Request,
  token: unknown,
  env: NewsletterEnv,
  expectedAction: string,
) {
  if (!env.TURNSTILE_SECRET_KEY) return env.NEWSLETTER_REQUIRE_TURNSTILE !== "true";

  const expectedHostnames = new Set(
    (env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return false;
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return false;

    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    return (
      result.success === true &&
      result.action === expectedAction &&
      typeof result.hostname === "string" &&
      expectedHostnames.has(result.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
