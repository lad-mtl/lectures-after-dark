# AGENTS.md

## Repo shape

- `src/` is the React 19 + Vite marketing site; routes are wired in `src/App.tsx`.
- `worker/` is the Cloudflare Worker entry (`worker/index.ts`) that serves `dist` assets, handles SPA fallback, proxies content, and handles `/api/contact`.
- `strapi/` is the current Strapi 5 app; production public reads should go browser -> Worker -> Strapi/API services, not directly to Strapi.
- `payload/` is the next CMS, isolated as a separate Next.js/OpenNext Cloudflare Worker with dedicated D1 and R2 bindings. It is staged alongside Strapi until content migration and API compatibility are complete.
- Seed/source content is file-backed under `content/` (`speakers`, `team-members`, `venues`, `faq`).

## Commands that matter

- Install all apps: `pnpm install`, `pnpm --dir strapi install`, and `pnpm --dir payload install`.
- Full frontend/Worker verification: `pnpm check` (`lint:fix` -> `type-check` -> `build`). Note this can modify files because `lint:fix` runs ESLint with `--fix`.
- Payload verification: `pnpm payload:check`; generate binding/Payload types with `pnpm payload:types`.
- Non-mutating checks: `pnpm run lint`, `pnpm run type-check`, `pnpm run build`.
- Local dev needs separate terminals: `pnpm strapi:dev`, `pnpm workers:dev`, then `pnpm dev`.
- Strapi commands are proxied from root: `pnpm strapi:build`, `pnpm strapi:seed`, `pnpm strapi:start`.
- Payload commands are proxied from root: `pnpm payload:dev`, `pnpm payload:build`, `pnpm payload:check`, `pnpm payload:types`, `pnpm payload:migrate:create`, `pnpm payload:preview`, `pnpm payload:deploy`.
- Worker commands: `pnpm workers:dev`, `pnpm workers:deploy`.
- There is no root test script configured. Payload has `test:int` and `test:e2e`; do not claim either ran unless invoked explicitly.

## Local/runtime gotchas

- Vite proxies `/api/content/*` to local Wrangler at `http://127.0.0.1:8787`; run the Worker or content fetches from the browser will fail.
- Wrangler reads local Worker env from `.dev.vars`; start from `.dev.vars.example` when missing.
- Strapi local API base should be `STRAPI_CONTENT_API_URL=http://127.0.0.1:1337/api`.
- Strapi requires Node `>=20 <=24`; SQLite users may need `better-sqlite3` rebuilt under that runtime.
- Payload requires Node `^18.20.2 || >=20.9.0`, a Workers Paid plan due to bundle size, and independently provisioned `D1`/`R2` bindings configured in `payload/wrangler.jsonc`.
- Production Payload auth is Cloudflare Access-only for `@lecturesafterdark.ca`: validate `Cf-Access-Jwt-Assertion` and auto-provision passwordless Payload user records. Local development uses the separate localhost-only custom strategy.
- `wrangler.toml` sets the site Worker `main = "worker/index.ts"`, assets from `dist`, and KV binding `CONTENT_CACHE`; do not put Payload bindings there.

## Content/API flow

- Frontend hooks in `src/hooks/useContent.ts` call `/api/content/<resource>` only.
- Worker content routes live in `worker/content.ts`; current routes include `speakers`, `venues`, `speaker-page`, `venue-page`, `faq`, `team-members`, `events`, and `instagram`.
- Strapi-backed routes normalize Strapi REST responses and refresh KV snapshots on success; on upstream failure they return stale `CONTENT_CACHE` snapshots when available.
- `events` and `instagram` are Strapi-backed collection routes. External cron jobs can sync Eventbrite/Instagram data into Strapi, but public reads should still go browser -> Worker -> Strapi.
- Contact form settings are Worker env vars (`CONTACT_FROM_EMAIL`, `CONTACT_CORE_EMAIL`, `CONTACT_MARKETING_EMAIL`) and delivery uses the Cloudflare `EMAIL` binding.

## Style/tooling notes

- Project is ESM (`"type": "module"`) and TypeScript; ESLint flat config only targets `**/*.{ts,tsx}` and ignores `dist`.
- Vite uses React Compiler via `babel-plugin-react-compiler` and Tailwind via `@tailwindcss/vite`.
- Keep normalized content shapes in sync between `worker/content.ts` interfaces/normalizers and `src/hooks/useContent.ts` interfaces.
