# AGENTS.md

## Repo shape

- `src/` is the React 19 + Vite marketing site; routes are wired in `src/App.tsx`.
- `worker/` is the Cloudflare Worker entry (`worker/index.ts`) that serves `dist` assets, handles SPA fallback, proxies content, and handles `/api/contact`.
- `strapi/` is a separate Strapi 5 app; production public reads should go browser -> Worker -> Strapi/API services, not directly to Strapi.
- Seed/source content is file-backed under `content/` (`speakers`, `team-members`, `venues`, `faq`).

## Commands that matter

- Install both apps: `pnpm install` and `pnpm --dir strapi install`.
- Full frontend/Worker verification: `pnpm check` (`lint:fix` -> `type-check` -> `build`). Note this can modify files because `lint:fix` runs ESLint with `--fix`.
- Non-mutating checks: `pnpm run lint`, `pnpm run type-check`, `pnpm run build`.
- Local dev needs separate terminals: `pnpm strapi:dev`, `pnpm workers:dev`, then `pnpm dev`.
- Strapi commands are proxied from root: `pnpm strapi:build`, `pnpm strapi:seed`, `pnpm strapi:start`.
- Worker commands: `pnpm workers:dev`, `pnpm workers:deploy`.
- There is no test script configured; do not claim tests ran unless you add/run one explicitly.

## Local/runtime gotchas

- Vite proxies `/api/content/*` to local Wrangler at `http://127.0.0.1:8787`; run the Worker or content fetches from the browser will fail.
- Wrangler reads local Worker env from `.dev.vars`; start from `.dev.vars.example` when missing.
- Strapi local API base should be `STRAPI_CONTENT_API_URL=http://127.0.0.1:1337/api`.
- Strapi requires Node `>=20 <=24`; SQLite users may need `better-sqlite3` rebuilt under that runtime.
- `wrangler.toml` sets Worker `main = "worker/index.ts"`, assets from `dist`, and KV binding `CONTENT_CACHE`.

## Content/API flow

- Frontend hooks in `src/hooks/useContent.ts` call `/api/content/<resource>` only.
- Worker content routes live in `worker/content.ts`; current routes include `speakers`, `venues`, `speaker-page`, `venue-page`, `faq`, `team-members`, `events`, and `instagram`.
- Strapi-backed routes normalize Strapi REST responses and refresh KV snapshots on success; on upstream failure they return stale `CONTENT_CACHE` snapshots when available.
- `events` and `instagram` are Strapi-backed collection routes. External cron jobs can sync Eventbrite/Instagram data into Strapi, but public reads should still go browser -> Worker -> Strapi.
- Contact form secrets/settings are Worker env vars (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_CORE_EMAIL`, `CONTACT_MARKETING_EMAIL`).

## Style/tooling notes

- Project is ESM (`"type": "module"`) and TypeScript; ESLint flat config only targets `**/*.{ts,tsx}` and ignores `dist`.
- Vite uses React Compiler via `babel-plugin-react-compiler` and Tailwind via `@tailwindcss/vite`.
- Keep normalized content shapes in sync between `worker/content.ts` interfaces/normalizers and `src/hooks/useContent.ts` interfaces.
