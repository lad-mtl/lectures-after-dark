# Lectures After Dark Payload CMS

Payload 3 runs here as a separate Next.js application deployed to Cloudflare Workers through OpenNext. It uses a dedicated Cloudflare D1 database for records and a dedicated R2 bucket for media.

This app is intentionally isolated from the existing marketing-site Worker. During the initial rollout, production content continues to flow through Strapi and `worker/content.ts`.

## Requirements

- Node.js `^18.20.2` or `>=20.9.0`
- pnpm 9, 10, or 11
- Wrangler authenticated to the Cloudflare account that hosts Lectures After Dark
- A Cloudflare Workers Paid plan (the Payload bundle exceeds the free-plan Worker size limit)

## Local development

Install this app independently from the repository root:

```bash
pnpm --dir payload install
```

Create the local environment file and generate a secret:

```bash
cp payload/.env.example payload/.env
openssl rand -hex 32
```

Put the generated value in `payload/.env` as `PAYLOAD_SECRET`, then start Payload:

```bash
pnpm payload:dev
```

The app runs at `http://localhost:3000`; the admin is at `http://localhost:3000/admin`.
Wrangler supplies local D1 and R2 bindings through `wrangler.local.jsonc`. Keeping local bindings separate prevents builds and development from writing to the production database. Local Cloudflare state is ignored under `payload/.wrangler/`.

## Cloudflare resources

The bindings in `wrangler.jsonc` are separate from the newsletter resources configured by the root Worker:

| Binding  | Resource name                   | Purpose                              |
| -------- | ------------------------------- | ------------------------------------ |
| `D1`     | `lectures-after-dark-cms`       | Payload records and migrations       |
| `R2`     | `lectures-after-dark-cms-media` | Uploaded media                       |
| `ASSETS` | OpenNext-generated assets       | Payload admin and application assets |

## Authentication

Production is protected by a Cloudflare Access self-hosted application covering `cms.lecturesafterdark.ca/*`. Its reusable **All LAD** policy admits only `@lecturesafterdark.ca` identities.

Payload does not accept email/password login. A custom authentication strategy verifies the `Cf-Access-Jwt-Assertion` signature, issuer, audience, expiry, stable subject, and email domain. The first authenticated request automatically creates a lightweight Payload user record for Admin permissions, preferences, and auditing; subsequent requests resolve the same record by Access subject or email. Identity fields are not editable in Admin.

The non-secret Access settings are declared under `vars` in `wrangler.jsonc`. Workers.dev and preview URLs remain disabled, preventing users from bypassing Access through another hostname.

Local development also remains passwordless: requests on `localhost` or `127.0.0.1` automatically use `developer@lecturesafterdark.ca`. This local-only strategy is selected by `CF_ACCESS_ENABLED=false` in `wrangler.local.jsonc` and is never included in the deployed Worker.

These resources are provisioned in the LAD Cloudflare account and configured in `wrangler.jsonc`. To recreate the stack in another account, run:

```bash
cd payload
pnpm exec wrangler login
pnpm exec wrangler d1 create lectures-after-dark-cms
pnpm exec wrangler r2 bucket create lectures-after-dark-cms-media
```

Then copy the returned D1 database ID into both `wrangler.jsonc` and `wrangler.local.jsonc`.

Set the production secret without committing it:

```bash
pnpm exec wrangler secret put PAYLOAD_SECRET
```

A secure value can be generated with `openssl rand -hex 32`.

## Schema and migrations

Payload collections are defined in `src/collections/`, and singleton page content is defined in `src/globals/`. The Strapi model mapping is:

| Strapi type    | Payload model                |
| -------------- | ---------------------------- |
| Speaker        | `speakers` collection        |
| Venue          | `venues` collection          |
| Team Member    | `team-members` collection    |
| Event          | `events` collection          |
| Instagram Post | `instagram-posts` collection |
| FAQ            | `faq` global                 |
| Speaker Page   | `speaker-page` global        |
| Venue Page     | `venue-page` global          |

These models preserve the existing field names and do not enable drafts because their Strapi counterparts had `draftAndPublish` disabled. Reads are permitted by Payload so an Access-authorized machine client can consume content; writes require an authenticated LAD editor.

After changing the schema, create and commit a migration:

```bash
pnpm payload:migrate:create
```

Migrations live in `src/migrations/`. Production deployment runs checked-in migrations against remote D1 before deploying application code. If migration fails, deployment stops.

## Seed content

The Payload seed command imports the repository-backed content from `content/`:

```bash
pnpm payload:seed
```

It upserts collection records by name only when that collection's source directory contains JSON files. It never deletes records, and empty `speakers/` and `team-members/` directories leave editor-created content untouched. It always updates the FAQ, Speaker Page, and Venue Page globals. Events and Instagram posts are externally synchronized data and are intentionally not changed by this seed.

After applying production migrations, seed the remote D1 database with:

```bash
pnpm payload:seed:production
```

## Validation

From the repository root:

```bash
pnpm payload:types
pnpm payload:check
```

The generated template also includes integration and Playwright tests:

```bash
pnpm --dir payload test:int
pnpm --dir payload test:e2e
```

The browser-based suite requires Playwright's browser dependencies.

## Preview and deployment

Build and preview through OpenNext:

```bash
pnpm payload:preview
```

After provisioning D1 and R2, setting `PAYLOAD_SECRET`, and committing migrations, deploy with:

```bash
pnpm payload:deploy
```

The deploy command applies remote D1 migrations, optimizes D1, builds the OpenNext Worker, and deploys it. Payload is available at:

- `https://cms.lecturesafterdark.ca`
- Admin: `https://cms.lecturesafterdark.ca/admin`

## Cloudflare limitations

- Payload's D1 and native R2 adapters are currently beta; keep Payload packages pinned together and review migrations during upgrades.
- Cloudflare Workers do not support Sharp. The media collection disables crop and focal-point processing; Payload image sizes are unavailable.
- Full GraphQL support is not guaranteed on Workers because of an upstream `workerd` limitation. Use the REST API for the initial content integration.
- The production logger uses Worker-safe structured console output. Enable Workers Logs in Cloudflare when needed and account for its quota usage.

## Upstream reference

This app is based on Payload's maintained [`with-cloudflare-d1`](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1) template.
