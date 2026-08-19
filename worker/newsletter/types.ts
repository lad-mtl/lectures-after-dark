export type NewsletterQueueMessage =
  | {
      kind: "send-confirmation";
      subscriberId: string;
      token: string;
    }
  | {
      kind: "eventbrite-published";
      eventId: string;
      webhookEventId: string;
    }
  | {
      kind: "dispatch-campaign";
      campaignId: string;
      cursor?: string;
    }
  | {
      kind: "send-campaign-email";
      deliveryId: string;
    };

export interface NewsletterEnv {
  NEWSLETTER_DB?: D1Database;
  NEWSLETTER_QUEUE?: Queue<NewsletterQueueMessage>;
  NEWSLETTER_ASSETS?: R2Bucket;
  EMAIL?: SendEmail;
  SITE_URL?: string;
  NEWSLETTER_FROM_EMAIL?: string;
  NEWSLETTER_REPLY_TO?: string;
  NEWSLETTER_TOKEN_SECRET?: string;
  NEWSLETTER_ALLOW_LOCAL_ADMIN?: string;
  NEWSLETTER_ASSET_BASE_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_HOSTNAMES?: string;
  NEWSLETTER_REQUIRE_TURNSTILE?: string;
  EVENTBRITE_API_TOKEN?: string;
  EVENTBRITE_PRIVATE_TOKEN?: string;
  EVENTBRITE_ORGANIZER_ID?: string;
  EVENTBRITE_WEBHOOK_SECRET?: string;
  EVENTBRITE_SEND_DELAY_MINUTES?: string;
}

export interface NewsletterCampaign {
  id: string;
  eventbrite_event_id: string | null;
  name: string;
  subject: string;
  preview_text: string;
  body_html: string;
  body_text: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  scheduled_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "pending" | "subscribed" | "unsubscribed" | "bounced" | "complained";
  confirmation_token_hash: string | null;
  confirmation_expires_at: string | null;
}

export interface NewsletterDelivery {
  id: string;
  campaign_id: string;
  subscriber_id: string;
  status: "queued" | "sending" | "sent" | "delivered" | "deferred" | "bounced" | "complained" | "failed";
  message_id: string | null;
}

export interface EmailSendingEvent {
  type:
    | "cf.email.sending.message.delivered"
    | "cf.email.sending.message.deferred"
    | "cf.email.sending.message.bounced"
    | "cf.email.sending.message.failed"
    | "cf.email.sending.message.rejected"
    | "cf.email.sending.message.complained";
  payload: {
    eventId: string;
    messageId: string;
    recipient: string;
    bounce?: {
      type?: "hard" | "soft";
    };
  };
}
