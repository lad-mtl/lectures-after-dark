# Cloudflare newsletter setup

The newsletter application code is complete, but its Cloudflare resources must be created in the Cloudflare account that owns `lecturesafterdark.ca`. Do not provision these resources from another account.

## 1. Create resources

```bash
pnpm exec wrangler d1 create lectures-after-dark-newsletter
pnpm exec wrangler queues create lectures-after-dark-newsletter
pnpm exec wrangler queues create lectures-after-dark-newsletter-dlq
pnpm exec wrangler queues create lectures-after-dark-email-events
pnpm exec wrangler r2 bucket create lectures-after-dark-newsletter-assets
```

Add the resulting D1 ID and these bindings to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "NEWSLETTER_DB"
database_name = "lectures-after-dark-newsletter"
database_id = "<D1_DATABASE_ID>"
migrations_dir = "worker/migrations"

[[send_email]]
name = "EMAIL"
allowed_sender_addresses = [
  "newsletter@mail.lecturesafterdark.ca",
  "feedback@mail.lecturesafterdark.ca",
]

[[queues.producers]]
binding = "NEWSLETTER_QUEUE"
queue = "lectures-after-dark-newsletter"

[[queues.consumers]]
queue = "lectures-after-dark-newsletter"
max_batch_size = 10
max_retries = 5
dead_letter_queue = "lectures-after-dark-newsletter-dlq"

# Cloudflare Email Sending lifecycle events are published to this queue.
[[queues.consumers]]
queue = "lectures-after-dark-email-events"
max_batch_size = 10
max_retries = 5
dead_letter_queue = "lectures-after-dark-newsletter-dlq"

[[r2_buckets]]
binding = "NEWSLETTER_ASSETS"
bucket_name = "lectures-after-dark-newsletter-assets"

[triggers]
crons = ["* * * * *"]
```

Apply the D1 migration:

```bash
pnpm exec wrangler d1 migrations apply NEWSLETTER_DB --local
pnpm exec wrangler d1 migrations apply NEWSLETTER_DB --remote
```

## 2. Configure Email Service

In **Cloudflare Dashboard → Compute → Email Service → Email Sending**:

1. Onboard `mail.lecturesafterdark.ca` as the sending domain.
2. Confirm its SPF, DKIM, DMARC, and bounce records.
3. Keep `newsletter@mail.lecturesafterdark.ca` and `feedback@mail.lecturesafterdark.ca` in the Worker's sender allowlist.
4. Create an Email Sending event subscription targeting `lectures-after-dark-email-events` for:
   - `message.delivered`
   - `message.deferred`
   - `message.bounced`
   - `message.complained`

The Worker consumes these events to update delivery records and suppress bounced or complaining subscribers.

## 3. Configure R2 assets

Expose `lectures-after-dark-newsletter-assets` through a Cloudflare-managed custom domain, for example `newsletter-media.lecturesafterdark.ca`. Set:

```toml
[vars]
NEWSLETTER_ASSET_BASE_URL = "https://newsletter-media.lecturesafterdark.ca"
```

Images uploaded from the editor must be publicly readable because email clients fetch them without authentication.

## 4. Add secrets

Generate a long random token for each secret. The Eventbrite webhook secret appears in the callback URL, while the Eventbrite API token is only stored in Worker secrets.

```bash
pnpm exec wrangler secret put NEWSLETTER_TOKEN_SECRET
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
pnpm exec wrangler secret put EVENTBRITE_API_TOKEN
pnpm exec wrangler secret put EVENTBRITE_WEBHOOK_SECRET
```

For local development, copy `.dev.vars.example` to `.dev.vars` and populate the same values. Never commit `.dev.vars`.

Add the Turnstile site key to `.env.local` for Vite:

```dotenv
VITE_TURNSTILE_SITE_KEY=<TURNSTILE_SITE_KEY>
```

## 5. Configure Cloudflare Access

Create a Cloudflare Access self-hosted application protecting both paths:

- `lecturesafterdark.ca/newsletter/admin*`
- `lecturesafterdark.ca/api/newsletter/admin/*`

Configure the Access policy with the users or identity groups that should manage newsletters. The Worker accepts any identity authenticated by that policy and records Cloudflare's `Cf-Access-Authenticated-User-Email` value for campaign attribution. Do not expose the admin API without the Access policy.

For local Wrangler development only, `NEWSLETTER_ALLOW_LOCAL_ADMIN=true` permits requests from `localhost` or `127.0.0.1`.

## 6. Configure Eventbrite

Create an Eventbrite webhook for the `event.published` action using:

```text
https://lecturesafterdark.ca/api/webhooks/eventbrite/<EVENTBRITE_WEBHOOK_SECRET>
```

The Worker treats the webhook as a notification only. It extracts the numeric event ID, fetches the event from Eventbrite using `EVENTBRITE_API_TOKEN`, verifies its organizer ID, and then creates both the scheduled announcement campaign and a post-event feedback job. It never fetches an arbitrary URL supplied by the webhook.

The announcement cancellation window defaults to ten minutes (`EVENTBRITE_SEND_DELAY_MINUTES`). The feedback job runs at 10:00 a.m. in the event's timezone on the morning after the event ends, fetches the event's paginated attendee list, and sends only to active attendees whose Eventbrite record has `checked_in = true`. Duplicate publication callbacks and duplicate attendee email addresses are ignored. Feedback recipients remain separate from newsletter subscribers and have a dedicated opt-out suppression list.

Configure the behavior with:

```dotenv
EVENT_FEEDBACK_ENABLED=true
EVENT_FEEDBACK_SEND_HOUR=10
EVENT_FEEDBACK_FORM_URL=https://round-tub-61e.notion.site/98f0b85f82298298b2080186e375c0ab
EVENT_FEEDBACK_FROM_EMAIL=Lectures After Dark <feedback@mail.lecturesafterdark.ca>
```

The Eventbrite private token must be authorized to read attendee details, including `profile.email`. Existing events that were published before this automation was deployed can be added from the **Event feedback** section of `/newsletter/admin` using their numeric Eventbrite event ID. Scheduled feedback jobs can also be cancelled there.

## 7. Local development

Run three terminals:

```bash
pnpm strapi:dev
pnpm workers:dev
pnpm dev
```

The Vite server proxies all `/api/*` requests to Wrangler. The admin studio is at `/newsletter/admin`.

Use remote bindings for Email Sending if you need real local test emails. Add `remote = true` to the local `[[send_email]]` binding only after authenticating Wrangler with the correct Cloudflare account.
