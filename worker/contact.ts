interface ContactEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  CONTACT_CORE_EMAIL?: string;
  CONTACT_MARKETING_EMAIL?: string;
}

type ContactInquiryType = "general" | "partnerships";

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  subject?: unknown;
  message?: unknown;
}

const RESEND_API_BASE_URL = "https://api.resend.com";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeInquiryType(value: unknown): ContactInquiryType {
  return value === "partnerships" ? "partnerships" : "general";
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

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return jsonResponse({ error: "Contact form email service is not configured." }, 500);
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email);
  const inquiryType = normalizeInquiryType(payload.inquiryType);
  const subject = normalizeText(payload.subject);
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

  const to =
    inquiryType === "partnerships"
      ? env.CONTACT_MARKETING_EMAIL ?? "marketing@lecturesafterdark.ca"
      : env.CONTACT_CORE_EMAIL ?? "core@lecturesafterdark.ca";

  const resendResponse = await fetch(`${RESEND_API_BASE_URL}/emails`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json; charset=utf-8",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [to],
      subject: `[Lectures After Dark Contact] ${subject}`,
      html: buildEmailHtml({ name, email, inquiryType, subject, message }),
      text: buildEmailText({ name, email, inquiryType, subject, message }),
      reply_to: email,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Resend send failure", {
      status: resendResponse.status,
      body: errorText,
    });
    return jsonResponse({ error: "Unable to send your message right now." }, 502);
  }

  return jsonResponse({ success: true });
}
