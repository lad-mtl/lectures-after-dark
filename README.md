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

## Legacy Strapi Setup

Seed data still lives in:

- `content/speakers/*.json`
- `content/team-members/*.json`
- `content/venues/*.json`
- `content/faq/faq.json`

The Strapi app remains temporarily in the repository for migration reference only. New content should be managed in Payload.

Events are read directly from Eventbrite and Instagram posts from the Instagram Graph API.

The Strapi app lives in:

- `strapi/`

Build and seed it with:

```bash
pnpm strapi:build
pnpm strapi:seed
```

The local admin is available at `http://127.0.0.1:1337/admin`.

Strapi requires Node `20` through `24`. If you are using SQLite locally, make sure `better-sqlite3` is built under that supported Node runtime.

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
pnpm strapi:dev
pnpm strapi:build
pnpm strapi:start
pnpm strapi:seed
```

## Public Content Endpoints

The frontend reads normalized content from:

- `/api/content/speakers`
- `/api/content/team-members`
- `/api/content/venues`
- `/api/content/faq`
- `/api/content/events`
- `/api/content/instagram`

## Strapi systemd

For an LXC or other Linux host, the repo includes a helper to install or update a `systemd` unit for Strapi:

```bash
cp .env.strapi.service.example .env.strapi.service
sudo ./scripts/install-strapi-systemd.sh
```

The script:

- installs dependencies unless `--skip-install` is passed
- runs `pnpm strapi:build` unless `--skip-build` is passed
- writes `/etc/systemd/system/lectures-after-dark-strapi.service` by default
- enables the unit
- starts it if stopped
- restarts it if already running

Tail logs with:

```bash
journalctl -u lectures-after-dark-strapi.service -f
```

## Automated Strapi Deploys

The repo includes a host-local auto-deploy path for `main`, which avoids inbound SSH from CI.

Use these scripts on the Strapi host:

- [`scripts/deploy-strapi-main.sh`](/Users/augusto.pinheiro/projects/lectures-after-dark/scripts/deploy-strapi-main.sh)
- [`scripts/install-strapi-autodeploy.sh`](/Users/augusto.pinheiro/projects/lectures-after-dark/scripts/install-strapi-autodeploy.sh)

Recommended setup:

1. Clone this repo into a dedicated deployment checkout on the Strapi host.
2. Make sure that checkout can run `git fetch origin main` non-interactively.
This can be HTTPS + credential helper or a GitHub deploy key.
3. Install the main Strapi service with [`scripts/install-strapi-systemd.sh`](/Users/augusto.pinheiro/projects/lectures-after-dark/scripts/install-strapi-systemd.sh).
4. Allow the deploy user to restart the Strapi service without an interactive password prompt.
5. Install the auto-deploy timer:

```bash
sudo ./scripts/install-strapi-autodeploy.sh --repo-root /path/to/lectures-after-dark
```

The timer checks `origin/main` every 2 minutes by default. When it sees a new commit, it resets the deployment checkout to `origin/main`, installs dependencies, rebuilds `strapi/`, and restarts the `lectures-after-dark-strapi` service.

Because the deploy script uses a hard reset, the remote checkout should be used only for deployment.

Example `sudoers` entry for the deploy user:

```sudoers
deployuser ALL=NOPASSWD: /usr/bin/systemctl restart lectures-after-dark-strapi, /usr/bin/systemctl status lectures-after-dark-strapi, /usr/bin/systemctl is-active lectures-after-dark-strapi
```
