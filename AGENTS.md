# AGENTS.md

## Repo shape

- `src/` is the React 19 + Vite marketing site; routes are wired in `src/App.tsx`.
- `worker/` is the Cloudflare Worker entry (`worker/index.ts`) that serves `dist` assets, handles SPA fallback, proxies content, and handles `/api/contact`.
- `payload/` is the current CMS, isolated as a separate Next.js/OpenNext Cloudflare Worker with dedicated D1 and R2 bindings. Production public reads go browser -> site Worker -> private `PAYLOAD_CMS` service binding.
- Seed/source content is file-backed under `content/` (`speakers`, `team-members`, `venues`, `faq`).

## Commands that matter

- Install the active apps: `pnpm install` and `pnpm --dir payload install`.
- Full frontend/Worker verification: `pnpm check` (`lint:fix` -> `type-check` -> `build`). Note this can modify files because `lint:fix` runs ESLint with `--fix`.
- Payload verification: `pnpm payload:check`; generate binding/Payload types with `pnpm payload:types`.
- Non-mutating checks: `pnpm run lint`, `pnpm run type-check`, `pnpm run build`.
- Local dev needs separate terminals: `pnpm payload:dev`, `pnpm workers:dev`, then `pnpm dev`.
- Payload commands are proxied from root: `pnpm payload:dev`, `pnpm payload:build`, `pnpm payload:check`, `pnpm payload:types`, `pnpm payload:migrate:create`, `pnpm payload:preview`, `pnpm payload:deploy`.
- Worker commands: `pnpm workers:dev`, `pnpm workers:deploy`.
- There is no root test script configured. Payload has `test:int` and `test:e2e`; do not claim either ran unless invoked explicitly.

## Local/runtime gotchas

- Vite proxies `/api/content/*` to local Wrangler at `http://127.0.0.1:8787`; run the Worker or content fetches from the browser will fail.
- Wrangler reads local Worker env from `.dev.vars`; start from `.dev.vars.example` when missing.
- Payload local API base should be `PAYLOAD_CONTENT_API_URL=http://127.0.0.1:3000/api`.
- Payload requires Node `^18.20.2 || >=20.9.0`, a Workers Paid plan due to bundle size, and independently provisioned `D1`/`R2` bindings configured in `payload/wrangler.jsonc`.
- Production Payload auth is Cloudflare Access-only for `@lecturesafterdark.ca`: validate `Cf-Access-Jwt-Assertion` and auto-provision passwordless Payload user records. Local development uses the separate localhost-only custom strategy.
- Payload media URLs use `MEDIA_BASE_URL`: production points at the public `media.lecturesafterdark.ca` R2 custom domain, while local development uses Payload's `/api/media/file` route.
- `pnpm payload:seed` imports file-backed content locally; `pnpm payload:seed:production` targets remote D1. Empty collection source directories are skipped, and Eventbrite/Instagram records are not seeded.
- `wrangler.toml` sets the site Worker `main = "worker/index.ts"`, assets from `dist`, KV binding `CONTENT_CACHE`, and the cross-Worker `PAYLOAD_CMS` service binding. Payload D1/R2 bindings remain only in `payload/wrangler.jsonc`.

## Content/API flow

- Frontend hooks in `src/hooks/useContent.ts` call `/api/content/<resource>` only.
- Worker content routes live in `worker/content.ts`; current routes include `speakers`, `venues`, `speaker-page`, `venue-page`, `faq`, `team-members`, `events`, and `instagram`.
- Routes normalize Payload REST responses and refresh KV snapshots on success; on upstream failure they return stale `CONTENT_CACHE` snapshots when available.
- Payload models are the `speakers`, `venues`, `team-members`, `events`, and `instagram-posts` collections plus the `faq`, `speaker-page`, and `venue-page` globals.
- Contact form settings are Worker env vars (`CONTACT_FROM_EMAIL`, `CONTACT_CORE_EMAIL`, `CONTACT_MARKETING_EMAIL`) and delivery uses the Cloudflare `EMAIL` binding.

## Style/tooling notes

- Project is ESM (`"type": "module"`) and TypeScript; ESLint flat config only targets `**/*.{ts,tsx}` and ignores `dist`.
- Vite uses React Compiler via `babel-plugin-react-compiler` and Tailwind via `@tailwindcss/vite`.
- Keep normalized content shapes in sync between `worker/content.ts` interfaces/normalizers and `src/hooks/useContent.ts` interfaces.
