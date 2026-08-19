import type { NewsletterCampaign, NewsletterEnv } from "./types";
import { escapeHtml, getSiteUrl } from "./utils";

function sender(env: NewsletterEnv): string | EmailAddress {
  const configured = env.NEWSLETTER_FROM_EMAIL ?? "Lectures After Dark <newsletter@mail.lecturesafterdark.ca>";
  const namedAddress = configured.match(/^(.+?)\s*<([^<>]+)>$/);
  if (!namedAddress) return configured;

  return {
    name: namedAddress[1].trim(),
    email: namedAddress[2].trim(),
  };
}

function emailShell(options: {
  previewText: string;
  content: string;
  unsubscribeUrl?: string;
}) {
  const unsubscribe = options.unsubscribeUrl
    ? `<p style="margin:24px 0 0;color:#9c8e82;font-size:12px;line-height:1.6;text-align:center;">You are receiving this because you joined the Lectures After Dark newsletter.<br><a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#ff8833;text-decoration:underline;">Unsubscribe</a></p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Lectures After Dark</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Oswald:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    body { margin: 0; background: #1a1612; color: #f5f0e8; font-family: 'Inter', Arial, sans-serif; }
    h1, h2, h3 { color: #f5f0e8; font-family: 'Oswald', 'Arial Narrow', Arial, sans-serif; line-height: 1.15; text-transform: uppercase; }
    p, li { color: #d4c7b8; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.7; }
    a { color: #ff8833; }
    img { display: block; height: auto; max-width: 100%; }
    blockquote { border-left: 3px solid #ff6f00; font-family: 'Playfair Display', Georgia, serif; margin-left: 0; padding-left: 18px; }
    hr { border: 0; border-top: 1px solid rgba(245,240,232,.18); margin: 28px 0; }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.previewText)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1a1612;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#241c17;border:1px solid rgba(245,240,232,.12);font-family:'Inter',Arial,sans-serif;">
        <tr><td style="padding:24px 32px;border-bottom:3px solid #ff6f00;text-align:center;">
          <p style="margin:0;color:#f5f0e8;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Lectures After Dark</p>
          <p style="margin:6px 0 0;color:#9c8e82;font-family:'Playfair Display',Georgia,serif;font-size:12px;font-style:italic;letter-spacing:.08em;">Intellectual nightlife for the modern mind</p>
        </td></tr>
        <tr><td style="padding:32px;">${options.content}</td></tr>
      </table>
      ${unsubscribe}
      <p style="margin:10px 0;color:#74685f;font-size:11px;text-align:center;">Lectures After Dark · Montreal, Quebec, Canada</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendConfirmationEmail(
  env: NewsletterEnv,
  email: string,
  token: string,
) {
  if (!env.EMAIL) throw new Error("Cloudflare Email Sending binding is not configured.");

  const confirmationUrl = `${getSiteUrl(env)}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const content = `
    <h1 style="margin:0 0 18px;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:30px;">Confirm your subscription</h1>
    <p>One final step: confirm that you want event announcements and updates from Lectures After Dark.</p>
    <p style="margin:28px 0;text-align:center;"><a href="${escapeHtml(confirmationUrl)}" style="display:inline-block;background:#ff6f00;color:#1a1612;padding:14px 24px;text-decoration:none;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Confirm subscription</a></p>
    <p style="font-size:13px;">This link expires in 24 hours. If you did not request this email, you can ignore it.</p>`;

  return env.EMAIL.send({
    from: sender(env),
    to: email,
    replyTo: env.NEWSLETTER_REPLY_TO,
    subject: "Confirm your Lectures After Dark subscription",
    html: emailShell({ previewText: "Confirm your newsletter subscription", content }),
    text: `Confirm your Lectures After Dark subscription:\n\n${confirmationUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendCampaignEmail(options: {
  env: NewsletterEnv;
  campaign: NewsletterCampaign;
  email: string;
  unsubscribeToken?: string;
  deliveryId: string;
}) {
  if (!options.env.EMAIL) {
    throw new Error("Cloudflare Email Sending binding is not configured.");
  }

  const unsubscribeUrl = options.unsubscribeToken
    ? `${getSiteUrl(options.env)}/api/newsletter/unsubscribe?token=${encodeURIComponent(options.unsubscribeToken)}`
    : undefined;
  const headers: Record<string, string> = {
    "List-Id": "Lectures After Dark Newsletter <newsletter.lecturesafterdark.ca>",
    "X-Campaign-ID": options.campaign.id,
    "X-Delivery-ID": options.deliveryId,
  };
  if (unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  return options.env.EMAIL.send({
    from: sender(options.env),
    to: options.email,
    replyTo: options.env.NEWSLETTER_REPLY_TO,
    subject: options.campaign.subject,
    html: emailShell({
      previewText: options.campaign.preview_text,
      content: options.campaign.body_html,
      unsubscribeUrl,
    }),
    text: unsubscribeUrl
      ? `${options.campaign.body_text}\n\nUnsubscribe: ${unsubscribeUrl}`
      : options.campaign.body_text,
    headers,
  });
}
