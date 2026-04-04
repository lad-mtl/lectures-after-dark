# CLAUDE.md

This repository has two runtime pieces:

- `src/`: React + Vite marketing site
- `worker/`: Cloudflare Worker that serves the SPA and proxies public Strapi reads

Strapi remains the content system, but it is expected to run as a separate service in production.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
pnpm workers:dev
pnpm workers:deploy
pnpm strapi:dev
pnpm strapi:build
pnpm strapi:start
pnpm strapi:seed
```

## Architecture

### Frontend

- React Router lives in `src/App.tsx`
- Content hooks live in `src/hooks/useContent.ts`
- The browser reads content from `/api/content/*`

### Worker

- Entry: `worker/index.ts`
- Strapi proxy + stale fallback logic: `worker/content.ts`
- Public routes:
  - `/api/content/speakers`
  - `/api/content/venues`
  - `/api/content/faq`
- On Strapi success, the Worker refreshes KV snapshots
- On Strapi timeout/failure, the Worker serves the last cached snapshot if available

### Strapi

- Strapi app lives in `strapi/`
- Content remains file-backed under `content/`
- Local Strapi authoring uses `pnpm strapi:dev`
- Production public reads should come through the Worker proxy, not from the browser directly to Strapi

## Required Environment

### Worker

- `STRAPI_CONTENT_API_URL`
- `STRAPI_CONTENT_API_TOKEN` (optional)
- `STRAPI_TIMEOUT_MS` (optional)
- `CONTENT_CACHE` KV binding

### Strapi

- `HOST`
- `PORT`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `DATABASE_CLIENT`
- `DATABASE_FILENAME`

## Local Dev Notes

- Run `pnpm workers:dev` and `pnpm dev` in separate terminals
- Run `pnpm strapi:dev` separately when you need the local Strapi admin/backend
- Vite proxies `/api/content/*` to the local Worker on `127.0.0.1:8787`
- The local Worker reads Strapi settings from `.dev.vars`
