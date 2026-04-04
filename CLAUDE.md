# CLAUDE.md

This repository has two runtime pieces:

- `src/`: React + Vite marketing site
- `worker/`: Cloudflare Worker that serves the SPA and proxies public Tina reads

TinaCMS remains the content system, but it is expected to run as a separate service in production.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
pnpm workers:dev
pnpm workers:deploy
pnpm tina:dev
pnpm tina:build
```

## Architecture

### Frontend

- React Router lives in `src/App.tsx`
- Content hooks live in `src/hooks/useTinaContent.ts`
- The browser reads content from `/api/content/*`

### Worker

- Entry: `worker/index.ts`
- Tina proxy + stale fallback logic: `worker/content.ts`
- Public routes:
  - `/api/content/speakers`
  - `/api/content/venues`
  - `/api/content/faq`
- On Tina success, the Worker refreshes KV snapshots
- On Tina timeout/failure, the Worker serves the last cached snapshot if available

### Tina

- Tina schema/config lives in `tina/`
- Content remains file-backed under `content/`
- Local Tina authoring still uses `pnpm tina:dev`
- Production public reads should come through the Worker proxy, not from the browser directly to Tina

## Required Environment

### Worker

- `TINA_CONTENT_API_URL`
- `TINA_CONTENT_API_TOKEN` (optional)
- `TINA_TIMEOUT_MS` (optional)
- `CONTENT_CACHE` KV binding

### Tina

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `NEXTAUTH_SECRET`

## Local Dev Notes

- Run `pnpm workers:dev` and `pnpm dev` in separate terminals
- Run `pnpm tina:dev` separately when you need the local Tina admin/backend
- Vite proxies `/api/content/*` to the local Worker on `127.0.0.1:8787`
- `pnpm tina:dev` no longer starts the Vite frontend as a child process
