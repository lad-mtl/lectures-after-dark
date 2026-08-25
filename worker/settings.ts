import { isValidEmail, sanitizeEmailHtml } from "./newsletter/utils";

export type SettingValue = string | number | boolean;
export type SettingSource = "dashboard" | "environment" | "default";

export interface SettingsEnv {
  NEWSLETTER_DB?: D1Database;
  NEWSLETTER_FROM_EMAIL?: string;
  NEWSLETTER_REPLY_TO?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_CORE_EMAIL?: string;
  CONTACT_MARKETING_EMAIL?: string;
  EVENT_FEEDBACK_ENABLED?: string;
  EVENT_FEEDBACK_SEND_HOUR?: string;
  EVENT_FEEDBACK_FORM_URL?: string;
  EVENT_FEEDBACK_FROM_EMAIL?: string;
  EVENTBRITE_SEND_DELAY_MINUTES?: string;
}

export interface EmailSettings {
  NEWSLETTER_FROM_EMAIL: string;
  NEWSLETTER_REPLY_TO: string;
  NEWSLETTER_CONFIRMATION_SUBJECT: string;
  NEWSLETTER_CONFIRMATION_PREVIEW: string;
  NEWSLETTER_CONFIRMATION_BODY_HTML: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_CORE_EMAIL: string;
  CONTACT_MARKETING_EMAIL: string;
  CONTACT_SUBJECT_PREFIX: string;
  EVENT_FEEDBACK_ENABLED: boolean;
  EVENT_FEEDBACK_SEND_HOUR: number;
  EVENT_FEEDBACK_FORM_URL: string;
  EVENT_FEEDBACK_FROM_EMAIL: string;
  EVENT_FEEDBACK_SUBJECT_TEMPLATE: string;
  EVENT_FEEDBACK_PREVIEW_TEXT: string;
  EVENT_FEEDBACK_BODY_HTML: string;
  EVENTBRITE_SEND_DELAY_MINUTES: number;
}

export type EmailSettingKey = keyof EmailSettings;

const DEFAULT_CONFIRMATION_BODY = `
  <h1 style="margin:0 0 18px;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:30px;">Confirm your subscription</h1>
  <p>One final step: confirm that you want event announcements and updates from Lectures After Dark.</p>
  <p style="margin:28px 0;text-align:center;"><a href="{{confirmation_url}}" style="display:inline-block;background:#ff6f00;color:#1a1612;padding:14px 24px;text-decoration:none;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Confirm subscription</a></p>
  <p style="font-size:13px;">This link expires in 24 hours. If you did not request this email, you can ignore it.</p>`;

const DEFAULT_FEEDBACK_BODY = `
  <h1 style="margin:0 0 18px;font-size:34px;">How was {{event_name}}?</h1>
  <p>Hey!</p>
  <p>Glad you joined us at Lectures After Dark. We read every bit of feedback and use it to shape what comes next—the speakers, the format, the venue, all of it.</p>
  <p>If you’ve got two minutes, fill out the form here:</p>
  <p style="margin:30px 0;text-align:center;"><a href="{{form_url}}" style="display:inline-block;background:#ff6f00;color:#1a1612;padding:15px 26px;text-decoration:none;font-weight:700;">Share your feedback</a></p>
  <p>Didn’t love something? Even better. Tell us.</p>
  <p>Thanks,<br><br>Augusto<br>Lectures After Dark</p>`;

const DEFAULTS: EmailSettings = {
  NEWSLETTER_FROM_EMAIL: "Lectures After Dark <newsletter@mail.lecturesafterdark.ca>",
  NEWSLETTER_REPLY_TO: "marketing@lecturesafterdark.ca",
  NEWSLETTER_CONFIRMATION_SUBJECT: "Confirm your Lectures After Dark subscription",
  NEWSLETTER_CONFIRMATION_PREVIEW: "Confirm your newsletter subscription",
  NEWSLETTER_CONFIRMATION_BODY_HTML: DEFAULT_CONFIRMATION_BODY,
  CONTACT_FROM_EMAIL: "Lectures After Dark <contact-form@mail.lecturesafterdark.ca>",
  CONTACT_CORE_EMAIL: "core@lecturesafterdark.ca",
  CONTACT_MARKETING_EMAIL: "marketing@lecturesafterdark.ca",
  CONTACT_SUBJECT_PREFIX: "Lectures After Dark Contact",
  EVENT_FEEDBACK_ENABLED: true,
  EVENT_FEEDBACK_SEND_HOUR: 10,
  EVENT_FEEDBACK_FORM_URL:
    "https://round-tub-61e.notion.site/98f0b85f82298298b2080186e375c0ab",
  EVENT_FEEDBACK_FROM_EMAIL: "Lectures After Dark <feedback@mail.lecturesafterdark.ca>",
  EVENT_FEEDBACK_SUBJECT_TEMPLATE: "How was {{event_name}}?",
  EVENT_FEEDBACK_PREVIEW_TEXT: "Tell us what worked—and what could be better.",
  EVENT_FEEDBACK_BODY_HTML: DEFAULT_FEEDBACK_BODY,
  EVENTBRITE_SEND_DELAY_MINUTES: 10,
};

const ENV_KEYS = new Set<EmailSettingKey>([
  "NEWSLETTER_FROM_EMAIL",
  "NEWSLETTER_REPLY_TO",
  "CONTACT_FROM_EMAIL",
  "CONTACT_CORE_EMAIL",
  "CONTACT_MARKETING_EMAIL",
  "EVENT_FEEDBACK_ENABLED",
  "EVENT_FEEDBACK_SEND_HOUR",
  "EVENT_FEEDBACK_FORM_URL",
  "EVENT_FEEDBACK_FROM_EMAIL",
  "EVENTBRITE_SEND_DELAY_MINUTES",
]);

let cachedOverrides: { expiresAt: number; values: Partial<EmailSettings> } | null = null;

function parseEnvironmentValue(key: EmailSettingKey, value: string): SettingValue {
  if (key === "EVENT_FEEDBACK_ENABLED") return value === "true";
  if (key === "EVENT_FEEDBACK_SEND_HOUR" || key === "EVENTBRITE_SEND_DELAY_MINUTES") {
    const number = Number(value);
    return Number.isFinite(number) ? number : DEFAULTS[key];
  }
  return value;
}

async function loadOverrides(env: SettingsEnv): Promise<Partial<EmailSettings>> {
  if (!env.NEWSLETTER_DB) return {};
  if (cachedOverrides && cachedOverrides.expiresAt > Date.now()) return cachedOverrides.values;

  try {
    const rows = await env.NEWSLETTER_DB
      .prepare("SELECT key, value FROM app_settings")
      .all<{ key: string; value: string }>();
    const values: Partial<Record<EmailSettingKey, SettingValue>> = {};
    for (const row of rows.results) {
      if (!(row.key in DEFAULTS)) continue;
      try {
        values[row.key as EmailSettingKey] = JSON.parse(row.value) as SettingValue;
      } catch {
        console.warn("Ignoring invalid dashboard setting", { key: row.key });
      }
    }
    cachedOverrides = { expiresAt: Date.now() + 30_000, values: values as Partial<EmailSettings> };
    return cachedOverrides.values;
  } catch (error) {
    console.error("Unable to load dashboard settings; using environment defaults", error);
    return {};
  }
}

function environmentSettings(env: SettingsEnv) {
  const values: Partial<Record<EmailSettingKey, SettingValue>> = {};
  for (const key of ENV_KEYS) {
    const raw = env[key as keyof SettingsEnv];
    if (typeof raw === "string" && raw !== "") {
      values[key] = parseEnvironmentValue(key, raw);
    }
  }
  return values as Partial<EmailSettings>;
}

export async function getEmailSettings(env: SettingsEnv): Promise<EmailSettings> {
  const environment = environmentSettings(env);
  const overrides = await loadOverrides(env);
  return { ...DEFAULTS, ...environment, ...overrides };
}

export async function getEmailSettingsSnapshot(env: SettingsEnv) {
  const environment = environmentSettings(env);
  const overrides = await loadOverrides(env);
  const values = { ...DEFAULTS, ...environment, ...overrides };
  const sources = {} as Record<EmailSettingKey, SettingSource>;

  for (const key of Object.keys(DEFAULTS) as EmailSettingKey[]) {
    sources[key] = key in overrides ? "dashboard" : key in environment ? "environment" : "default";
  }

  return { values, sources };
}

function emailAddress(value: string) {
  const named = value.match(/^([^<>\r\n]{1,100})\s*<([^<>\s]+)>$/);
  return named ? named[2].trim().toLowerCase() : value.trim().toLowerCase();
}

function validateUrl(value: string) {
  if (value.length > 2048 || [...value].some((character) => character.charCodeAt(0) < 32)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeSetting(key: EmailSettingKey, raw: unknown): SettingValue {
  if (key === "EVENT_FEEDBACK_ENABLED") {
    if (typeof raw !== "boolean") throw new Error("must be true or false");
    return raw;
  }

  if (key === "EVENT_FEEDBACK_SEND_HOUR" || key === "EVENTBRITE_SEND_DELAY_MINUTES") {
    if (typeof raw !== "number" || !Number.isInteger(raw)) throw new Error("must be a whole number");
    if (key === "EVENT_FEEDBACK_SEND_HOUR" && (raw < 0 || raw > 23)) {
      throw new Error("must be between 0 and 23");
    }
    if (key === "EVENTBRITE_SEND_DELAY_MINUTES" && (raw < 1 || raw > 1440)) {
      throw new Error("must be between 1 and 1440");
    }
    return raw;
  }

  if (typeof raw !== "string") throw new Error("must be text");
  const value = raw.trim();
  if (key === "NEWSLETTER_REPLY_TO" && !value) return "";

  if (
    key === "NEWSLETTER_FROM_EMAIL" ||
    key === "NEWSLETTER_REPLY_TO" ||
    key === "CONTACT_FROM_EMAIL" ||
    key === "CONTACT_CORE_EMAIL" ||
    key === "CONTACT_MARKETING_EMAIL" ||
    key === "EVENT_FEEDBACK_FROM_EMAIL"
  ) {
    if (!isValidEmail(emailAddress(value))) throw new Error("must contain a valid email address");
    return value;
  }

  if (key === "EVENT_FEEDBACK_FORM_URL") {
    if (!validateUrl(value.replaceAll("{{event_name}}", "event"))) {
      throw new Error("must be a valid HTTP or HTTPS URL");
    }
    return value;
  }

  if (key.endsWith("_BODY_HTML")) {
    if (!value || value.length > 100_000) throw new Error("must be between 1 and 100,000 characters");
    if (key === "NEWSLETTER_CONFIRMATION_BODY_HTML" && !value.includes("{{confirmation_url}}")) {
      throw new Error("must include {{confirmation_url}}");
    }
    if (key === "EVENT_FEEDBACK_BODY_HTML" && !value.includes("{{form_url}}")) {
      throw new Error("must include {{form_url}}");
    }
    return sanitizeEmailHtml(value);
  }

  const maxLength = key.includes("PREVIEW") ? 240 : key.includes("SUBJECT") ? 200 : 120;
  if (!value || value.length > maxLength || /[\r\n]/.test(value)) {
    throw new Error(`must be between 1 and ${maxLength} characters on one line`);
  }
  return value;
}

export async function updateEmailSettings(
  env: SettingsEnv,
  input: Record<string, unknown>,
  adminEmail: string,
) {
  if (!env.NEWSLETTER_DB) throw new Error("Dashboard database is not configured.");
  const normalized: Partial<Record<EmailSettingKey, SettingValue>> = {};
  const errors: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(input)) {
    if (!(rawKey in DEFAULTS)) {
      errors[rawKey] = "is not a configurable setting";
      continue;
    }
    const key = rawKey as EmailSettingKey;
    try {
      normalized[key] = normalizeSetting(key, rawValue);
    } catch (error) {
      errors[key] = error instanceof Error ? error.message : "is invalid";
    }
  }

  if (Object.keys(errors).length) return { success: false as const, errors };

  const now = new Date().toISOString();
  const statements = Object.entries(normalized).map(([key, value]) =>
    env.NEWSLETTER_DB!
      .prepare(
        `INSERT INTO app_settings (key, value, updated_by, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?4)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
      )
      .bind(key, JSON.stringify(value), adminEmail, now),
  );

  if (statements.length) await env.NEWSLETTER_DB.batch(statements);
  cachedOverrides = null;
  return { success: true as const };
}
