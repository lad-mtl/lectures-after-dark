import { sendCampaignEmail, sendConfirmationEmail } from "./email";
import {
  createCampaignFromEventbrite,
  recordEventbriteWebhookError,
} from "./eventbrite";
import type {
  EmailSendingEvent,
  NewsletterCampaign,
  NewsletterDelivery,
  NewsletterEnv,
  NewsletterQueueMessage,
  NewsletterSubscriber,
} from "./types";
import { createUnsubscribeToken, requireDatabase, sha256 } from "./utils";

function isNewsletterQueueMessage(value: unknown): value is NewsletterQueueMessage {
  if (!value || typeof value !== "object" || !("kind" in value)) return false;
  return [
    "send-confirmation",
    "eventbrite-published",
    "dispatch-campaign",
    "send-campaign-email",
  ].includes(String(value.kind));
}

function isEmailSendingEvent(value: unknown): value is EmailSendingEvent {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  return String(value.type).startsWith("cf.email.sending.message.");
}

async function processConfirmation(
  env: NewsletterEnv,
  message: Extract<NewsletterQueueMessage, { kind: "send-confirmation" }>,
) {
  const db = requireDatabase(env);
  const subscriber = await db
    .prepare(
      `SELECT id, email, status, confirmation_token_hash, confirmation_expires_at
       FROM newsletter_subscribers WHERE id = ?1`,
    )
    .bind(message.subscriberId)
    .first<NewsletterSubscriber>();

  if (!subscriber || subscriber.status !== "pending") return;
  if ((await sha256(message.token)) !== subscriber.confirmation_token_hash) return;

  await sendConfirmationEmail(env, subscriber.email, message.token);
}

async function dispatchCampaign(
  env: NewsletterEnv,
  message: Extract<NewsletterQueueMessage, { kind: "dispatch-campaign" }>,
) {
  if (!env.NEWSLETTER_QUEUE) throw new Error("Newsletter Queue binding is not configured.");
  const db = requireDatabase(env);
  const campaign = await db
    .prepare("SELECT id, status FROM newsletter_campaigns WHERE id = ?1")
    .bind(message.campaignId)
    .first<{ id: string; status: string }>();
  if (!campaign || campaign.status !== "sending") return;

  const now = new Date().toISOString();
  if (!message.cursor) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO newsletter_deliveries (
           id, campaign_id, subscriber_id, status, created_at, updated_at
         )
         SELECT lower(hex(randomblob(16))), ?1, subscriber.id, 'queued', ?2, ?2
         FROM newsletter_subscribers AS subscriber
         WHERE subscriber.status = 'subscribed'`,
      )
      .bind(message.campaignId, now)
      .run();
  }

  const cursor = message.cursor ?? "";
  const deliveries = await db
    .prepare(
      `SELECT id FROM newsletter_deliveries
       WHERE campaign_id = ?1 AND id > ?2
       ORDER BY id ASC LIMIT 100`,
    )
    .bind(message.campaignId, cursor)
    .all<{ id: string }>();

  if (!deliveries.results.length) {
    await completeCampaignIfFinished(env, message.campaignId);
    return;
  }

  await env.NEWSLETTER_QUEUE.sendBatch(
    deliveries.results.map((delivery) => ({
      body: { kind: "send-campaign-email", deliveryId: delivery.id },
    })),
  );

  const lastDelivery = deliveries.results[deliveries.results.length - 1];
  if (deliveries.results.length === 100 && lastDelivery) {
    await env.NEWSLETTER_QUEUE.send({
      kind: "dispatch-campaign",
      campaignId: message.campaignId,
      cursor: lastDelivery.id,
    });
  }
}

async function completeCampaignIfFinished(env: NewsletterEnv, campaignId: string) {
  const db = requireDatabase(env);
  const remaining = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM newsletter_deliveries
       WHERE campaign_id = ?1 AND status IN ('queued', 'sending')`,
    )
    .bind(campaignId)
    .first<{ count: number }>();

  if ((remaining?.count ?? 0) === 0) {
    await db
      .prepare(
        `UPDATE newsletter_campaigns
         SET status = 'sent', sent_at = COALESCE(sent_at, ?2), updated_at = ?2
         WHERE id = ?1 AND status = 'sending'`,
      )
      .bind(campaignId, new Date().toISOString())
      .run();
  }
}

async function sendDelivery(
  env: NewsletterEnv,
  message: Extract<NewsletterQueueMessage, { kind: "send-campaign-email" }>,
) {
  const db = requireDatabase(env);
  const delivery = await db
    .prepare(
      `SELECT id, campaign_id, subscriber_id, status, message_id
       FROM newsletter_deliveries WHERE id = ?1`,
    )
    .bind(message.deliveryId)
    .first<NewsletterDelivery>();
  if (!delivery || ["sent", "delivered", "bounced", "complained"].includes(delivery.status)) return;

  const claimed = await db
    .prepare(
      `UPDATE newsletter_deliveries SET status = 'sending', updated_at = ?2
       WHERE id = ?1 AND status IN ('queued', 'failed')`,
    )
    .bind(delivery.id, new Date().toISOString())
    .run();
  if (!claimed.meta.changes) return;

  const [campaign, subscriber] = await Promise.all([
    db
      .prepare(
        `SELECT id, eventbrite_event_id, name, subject, preview_text, body_html, body_text,
                status, scheduled_at, created_by, created_at, updated_at, sent_at
         FROM newsletter_campaigns WHERE id = ?1`,
      )
      .bind(delivery.campaign_id)
      .first<NewsletterCampaign>(),
    db
      .prepare(
        `SELECT id, email, status, confirmation_token_hash, confirmation_expires_at
         FROM newsletter_subscribers WHERE id = ?1`,
      )
      .bind(delivery.subscriber_id)
      .first<NewsletterSubscriber>(),
  ]);

  if (!campaign || !subscriber || subscriber.status !== "subscribed") {
    await db
      .prepare(
        "UPDATE newsletter_deliveries SET status = 'failed', error = ?2, updated_at = ?3 WHERE id = ?1",
      )
      .bind(delivery.id, "Campaign or active subscriber was not found.", new Date().toISOString())
      .run();
    await completeCampaignIfFinished(env, delivery.campaign_id);
    return;
  }

  try {
    const unsubscribeToken = await createUnsubscribeToken(subscriber.id, env);
    const result = await sendCampaignEmail({
      env,
      campaign,
      email: subscriber.email,
      unsubscribeToken,
      deliveryId: delivery.id,
    });
    await db
      .prepare(
        `UPDATE newsletter_deliveries
         SET status = 'sent', message_id = ?2, error = NULL, updated_at = ?3
         WHERE id = ?1`,
      )
      .bind(delivery.id, result.messageId, new Date().toISOString())
      .run();
    await completeCampaignIfFinished(env, delivery.campaign_id);
  } catch (error) {
    await db
      .prepare(
        `UPDATE newsletter_deliveries
         SET status = 'failed', error = ?2, updated_at = ?3 WHERE id = ?1`,
      )
      .bind(
        delivery.id,
        error instanceof Error ? error.message.slice(0, 1000) : "Unknown email sending error",
        new Date().toISOString(),
      )
      .run();
    await completeCampaignIfFinished(env, delivery.campaign_id);
    throw error;
  }
}

async function processEmailSendingEvent(env: NewsletterEnv, event: EmailSendingEvent) {
  const db = requireDatabase(env);
  const eventStatus = event.type.split(".").at(-1);
  if (
    !eventStatus ||
    !["delivered", "deferred", "bounced", "failed", "rejected", "complained"].includes(eventStatus)
  ) return;
  const deliveryStatus = eventStatus === "rejected" ? "failed" : eventStatus;

  await db
    .prepare(
      `UPDATE newsletter_deliveries SET status = ?2, updated_at = ?3
       WHERE message_id = ?1`,
    )
    .bind(event.payload.messageId, deliveryStatus, new Date().toISOString())
    .run();

  const shouldSuppress =
    event.type === "cf.email.sending.message.complained" ||
    (event.type === "cf.email.sending.message.bounced" && event.payload.bounce?.type === "hard");
  if (shouldSuppress) {
    await db
      .prepare(
        `UPDATE newsletter_subscribers
         SET status = ?2, updated_at = ?3 WHERE email = ?1`,
      )
      .bind(
        event.payload.recipient.toLowerCase(),
        event.type === "cf.email.sending.message.complained" ? "complained" : "bounced",
        new Date().toISOString(),
      )
      .run();
  }
}

async function processNewsletterMessage(env: NewsletterEnv, message: NewsletterQueueMessage) {
  switch (message.kind) {
    case "send-confirmation":
      return processConfirmation(env, message);
    case "eventbrite-published":
      try {
        return await createCampaignFromEventbrite({
          env,
          eventId: message.eventId,
          webhookEventId: message.webhookEventId,
        });
      } catch (error) {
        await recordEventbriteWebhookError(env, message.webhookEventId, error);
        throw error;
      }
    case "dispatch-campaign":
      return dispatchCampaign(env, message);
    case "send-campaign-email":
      return sendDelivery(env, message);
  }
}

export async function handleNewsletterQueue(batch: MessageBatch<unknown>, env: NewsletterEnv) {
  for (const message of batch.messages) {
    try {
      if (isEmailSendingEvent(message.body)) {
        await processEmailSendingEvent(env, message.body);
      } else if (isNewsletterQueueMessage(message.body)) {
        await processNewsletterMessage(env, message.body);
      } else {
        console.warn("Ignoring unknown newsletter queue message", { messageId: message.id });
      }
      message.ack();
    } catch (error) {
      console.error("Newsletter queue message failed", { messageId: message.id, error });
      message.retry({ delaySeconds: Math.min(300, 10 * 2 ** Math.max(0, message.attempts - 1)) });
    }
  }
}

export async function dispatchDueCampaigns(env: NewsletterEnv) {
  if (!env.NEWSLETTER_QUEUE || !env.NEWSLETTER_DB) {
    console.warn("Newsletter scheduled dispatch skipped because bindings are not configured.");
    return;
  }

  const now = new Date().toISOString();
  const recoveryCutoff = new Date(Date.now() - 60_000).toISOString();
  const due = await env.NEWSLETTER_DB
    .prepare(
      `SELECT id, status FROM newsletter_campaigns
       WHERE (status = 'scheduled' AND scheduled_at <= ?1)
          OR (status = 'sending' AND updated_at <= ?2 AND NOT EXISTS (
                SELECT 1 FROM newsletter_deliveries
                WHERE campaign_id = newsletter_campaigns.id
              ))
       ORDER BY scheduled_at ASC LIMIT 20`,
    )
    .bind(now, recoveryCutoff)
    .all<{ id: string; status: "scheduled" | "sending" }>();

  for (const campaign of due.results) {
    if (campaign.status === "scheduled") {
      const claimed = await env.NEWSLETTER_DB
        .prepare(
          `UPDATE newsletter_campaigns SET status = 'sending', updated_at = ?2
           WHERE id = ?1 AND status = 'scheduled'`,
        )
        .bind(campaign.id, now)
        .run();
      if (!claimed.meta.changes) continue;
    }

    try {
      await env.NEWSLETTER_QUEUE.send({ kind: "dispatch-campaign", campaignId: campaign.id });
    } catch (error) {
      if (campaign.status === "scheduled") {
        await env.NEWSLETTER_DB
          .prepare(
            `UPDATE newsletter_campaigns SET status = 'scheduled', updated_at = ?2
             WHERE id = ?1 AND status = 'sending'`,
          )
          .bind(campaign.id, new Date().toISOString())
          .run();
      }
      throw error;
    }
  }
}
