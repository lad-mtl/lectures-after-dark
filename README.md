# Lectures After Dark

Marketing site for Lectures After Dark.

## Stack

- Frontend: React 19 + Vite
- Edge layer: Cloudflare Workers
- CMS: Payload 3 on Cloudflare Workers, D1, and R2
- Content fallback cache: Cloudflare KV

## Local Development

Install dependencies once:

```bash
pnpm install
pnpm --dir payload install
```

Run Payload, the site Worker, and the frontend in separate terminals:

```bash
pnpm payload:dev
pnpm workers:dev
pnpm dev
```

The public frontend reads content from `/api/content/*`, which Vite proxies to the local Worker. The Worker fetches Payload content server-to-server and can fall back to cached snapshots from KV.

## Worker Setup

The Worker expects these variables and bindings:

- `PAYLOAD_CONTENT_API_URL`: Payload REST API base URL
- `PAYLOAD_TIMEOUT_MS`: optional upstream timeout override
- `PAYLOAD_CMS`: production service binding to the separate `lectures-after-dark-cms` Worker
- `EVENTBRITE_API_BASE_URL`: optional Eventbrite API base URL, defaults to `https://www.eventbriteapi.com/v3`
- `EVENTBRITE_PRIVATE_TOKEN`: Eventbrite private token used for server-side event reads
- `EVENTBRITE_ORGANIZER_ID`: optional Eventbrite organizer/account ID. The Worker auto-discovers it from the token when omitted.
- `EVENTBRITE_ORGANIZATION_NAME`: optional exact organization name used during auto-discovery, defaults to `Lectures After Dark`
- `EVENTBRITE_TIMEOUT_MS`: optional Eventbrite upstream timeout override
- `INSTAGRAM_API_BASE_URL`: optional Instagram API base URL, defaults to `https://graph.instagram.com`
- `INSTAGRAM_ACCESS_TOKEN`: Instagram user access token used for basic media reads
- `INSTAGRAM_POSTS_LIMIT`: optional number of latest posts to request
- `INSTAGRAM_TIMEOUT_MS`: optional Instagram upstream timeout override
- `CONTENT_CACHE`: KV namespace binding used for stale fallback responses

The production service binding invokes Payload privately without crossing Cloudflare Access. For a local Payload instance, use:

```env
PAYLOAD_CONTENT_API_URL=http://127.0.0.1:3000/api
```

For local Worker development, Wrangler reads [`.dev.vars`](/Users/augusto.pinheiro/projects/lectures-after-dark/.dev.vars) automatically. The repo includes a local default and a copyable example:

```bash
cp .dev.vars.example .dev.vars
```

Public requests should flow through the Worker proxy instead of hitting Payload directly from the browser. Events are read from Eventbrite and Instagram posts from the Instagram Graph API; their tokens remain server-side in Worker environment variables.

## Contact Form Protection

The contact form uses the same Turnstile widget and secret as the newsletter, with the distinct `contact` action. Production verifies the token action and hostname in the Worker, then applies the `CONTACT_RATE_LIMITER` binding at five verified submissions per minute for both the source IP and normalized email address. Set `CONTACT_REQUIRE_TURNSTILE=true` and `CONTACT_REQUIRE_RATE_LIMIT=true` in production; local defaults remain optional in `.dev.vars.example`.

## Newsletter

Email operations use Cloudflare D1, Email Sending, Queues, R2, Turnstile, Cron Triggers, and Access. The dashboard at `/newsletter/admin` includes delivery metrics, a WYSIWYG/HTML newsletter campaign studio, scheduled delivery, Eventbrite post-event feedback automation, a contact-form inbox, and D1-backed runtime settings. Double opt-in, one-click unsubscribe, delivery event processing, and Eventbrite `event.published` automation remain handled by the Worker.

Cloudflare resource provisioning and configuration are documented in [`docs/newsletter-setup.md`](docs/newsletter-setup.md).

## Payload CMS

The new Payload app lives in [`payload/`](payload/) and is deployed as a separate Cloudflare Worker through OpenNext. It has dedicated D1 and R2 bindings, so it does not share the newsletter database or asset bucket.

Start it locally with:

```bash
pnpm payload:dev
```

The Payload admin is available locally at `http://localhost:3000/admin` and in production at `https://cms.lecturesafterdark.ca/admin`. Provisioning, migrations, validation, deployment, and Cloudflare limitations are documented in [`payload/README.md`](payload/README.md).

Payload is protected by Cloudflare Access for `@lecturesafterdark.ca` identities and uses Access-backed passwordless editor records instead of Payload credentials. Its collections and globals back the site Worker through a private Cloudflare service binding, with repository-backed seed support for speakers, team members, venues, FAQ, and page CTAs.

## Seed Content

`pnpm payload:seed` imports the repository content into a local Payload database, and `pnpm payload:seed:production` targets the remote D1 database:

- `content/speakers/*.json`
- `content/team-members/*.json`
- `content/venues/*.json`
- `content/faq/faq.json`

Events are read directly from Eventbrite and Instagram posts from the Instagram Graph API.

## Commands

```bash
pnpm dev
pnpm build
pnpm type-check
pnpm workers:dev
pnpm workers:deploy
pnpm payload:dev
pnpm payload:build
pnpm payload:check
pnpm payload:types
pnpm payload:migrate:create
pnpm payload:preview
pnpm payload:deploy
```

## Public Content Endpoints

The frontend reads normalized content from:

- `/api/content/speakers`
- `/api/content/team-members`
- `/api/content/venues`
- `/api/content/faq`
- `/api/content/events`
- `/api/content/instagram`
