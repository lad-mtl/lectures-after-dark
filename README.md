# Lectures After Dark

Marketing site for Lectures After Dark.

## Stack

- Frontend: React 19 + Vite
- Edge layer: Cloudflare Workers
- CMS: self-hosted TinaCMS
- Content fallback cache: Cloudflare KV

## Local Development

Install dependencies once:

```bash
pnpm install
```

Run the frontend and Worker in separate terminals:

```bash
pnpm workers:dev
pnpm dev
```

If you want the Tina editing environment locally, run:

```bash
pnpm tina:dev
```

The public frontend reads content from `/api/content/*`, which Vite proxies to the local Worker. The Worker fetches Tina content server-to-server from the configured Tina GraphQL endpoint and can fall back to cached snapshots from KV.

## Worker Setup

The Worker expects these secrets/bindings:

- `TINA_CONTENT_API_URL`: Tina GraphQL endpoint used for public read queries
- `TINA_CONTENT_API_TOKEN`: optional bearer token if your Tina host protects GraphQL reads
- `TINA_TIMEOUT_MS`: optional upstream timeout override
- `CONTENT_CACHE`: KV namespace binding used for stale fallback responses

The old embedded Tina backend is no longer used in production. Public requests should flow through the Worker proxy instead of hitting Tina directly from the browser.

## Tina Setup

Tina content still lives in:

- `content/speakers/*.json`
- `content/venues/*.json`
- `content/faq/faq.json`

Tina schema/config remains in:

- `tina/config.ts`
- `tina/database.ts`

For standalone Tina hosting, expose its GraphQL endpoint and point `TINA_CONTENT_API_URL` at it.

## Commands

```bash
pnpm dev
pnpm build
pnpm type-check
pnpm workers:dev
pnpm workers:deploy
pnpm tina:dev
pnpm tina:build
```

## Public Content Endpoints

The frontend reads normalized content from:

- `/api/content/speakers`
- `/api/content/venues`
- `/api/content/faq`
