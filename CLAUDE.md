# CLAUDE.md

This repository has three runtime pieces:

- `src/`: React + Vite marketing site
- `worker/`: Cloudflare Worker that serves the SPA and proxies public content reads
- `payload/`: Payload CMS, deployed as the separate `lectures-after-dark-cms` Worker (Next.js through OpenNext, with its own D1 and R2)

`AGENTS.md` has the longer reference for commands, gotchas and the content flow.

## Common Commands

```bash
pnpm install
pnpm --dir payload install
pnpm dev
pnpm build
pnpm type-check
pnpm test
pnpm workers:dev
pnpm workers:deploy
pnpm payload:dev
pnpm payload:check
pnpm payload:types
pnpm payload:migrate:create
pnpm payload:seed
pnpm payload:deploy
```

## Architecture

### Frontend

- React Router lives in `src/App.tsx`
- Content hooks live in `src/hooks/useContent.ts`
- The browser reads content from `/api/content/*`

### Worker

- Entry: `worker/index.ts`
- Content proxy and stale fallback logic: `worker/content.ts`
- Public routes under `/api/content/`: `speakers`, `venues`, `team-members`, `faq`, `speaker-page`, `venue-page`, `events`, `instagram`
- Payload-backed routes call the CMS through the `PAYLOAD_CMS` service binding in production
- `events` reads Eventbrite and `instagram` reads the Instagram Graph API directly
- On upstream success, the Worker refreshes KV snapshots. On timeout or failure, it serves the last cached snapshot if one exists

### Payload

- Collections in `payload/src/collections/`, globals in `payload/src/globals/`
- Seed content is file-backed under `content/` and imported with `pnpm payload:seed`
- Schema changes need a migration: `pnpm payload:migrate:create <name>`, then commit the generated files in `payload/src/migrations/`
- Cloudflare Access protects `cms.lecturesafterdark.ca`. `/api/*` has an Access bypass, so the Payload strategy also accepts the `CF_Authorization` cookie on same-origin requests (`payload/src/auth/cloudflare-access.ts`)
- Users can enable a Payload API key on their own user record. Clients send `Authorization: users API-Key <key>`

## Deployment

Both Workers deploy through Cloudflare Workers Builds on push to `main`.

- Site Worker (`lectures-after-dark`): builds from the repo root and ignores changes under `payload/`
- CMS Worker (`lectures-after-dark-cms`): root `payload`, deploy command `pnpm run deploy`, which runs D1 migrations before the OpenNext build and deploy. Non-production branches only run the build, because previews would share the production D1 and R2

## Required Environment

### Worker

- `PAYLOAD_CONTENT_API_URL`
- `PAYLOAD_TIMEOUT_MS` (optional)
- `PAYLOAD_CMS` service binding
- `EVENTBRITE_PRIVATE_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, and the optional `EVENTBRITE_*` and `INSTAGRAM_*` settings in `.dev.vars.example`
- `CONTENT_CACHE` KV binding

### Payload

- `PAYLOAD_SECRET`
- `CF_ACCESS_ENABLED`, `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CF_ACCESS_EMAIL_DOMAIN` (set in `payload/wrangler.jsonc`)
- `D1` and `R2` bindings in `payload/wrangler.jsonc`

## Local Dev Notes

- Run `pnpm payload:dev`, `pnpm workers:dev` and `pnpm dev` in separate terminals
- Vite proxies `/api/content/*` to the local Worker on `127.0.0.1:8787`
- The local Worker reads its settings from `.dev.vars`; set `PAYLOAD_CONTENT_API_URL=http://127.0.0.1:3000/api`
