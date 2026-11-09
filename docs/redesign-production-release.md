# Redesign production release

## Current status: CMS/data live and verified; site activation next

### Approved transfer execution

- Normal Payload `migrate` runner applied only `20261109_000001_redesign_content`; remote journal readback confirms batch 6. No bare-SQL migration or destructive down migration was used.
- Isolated full-predecessor D1 content import passed twice with all fields compared, original IDs/records preserved, foreign keys valid, and no conflicts. Production import readback matches the exact same canonical SHA256: `4fa4e732f5463610efc1297ce14d7214f1328e9b4c50174aeb5923a751097d5b`.
- Production now contains 21 speakers, 23 topics, 2 team members, 36 media and 0 editorial events. Existing 13 speaker IDs and 16 media rows are preserved. Twelve existing portraits and one team description were replaced as approved; reviewed portrait credit retained. New speaker IDs are 14-21; new media IDs are 17-36.
- All 20 portraits use new `redesign-SHA256.extension` production keys. R2 downloads AND real-browser public URL reads independently verified every SHA256, byte size and MIME type. No old assets were deleted.
- Private mapping, import SQL, expected/readback JSON, portrait copies and summaries: `/home/horisofine/project/redesign-integration-backups/release-auth-20261109T030231Z/approved-transfer/`. SQL SHA256: `2a54498126ba70f4d26ba3f57d0851ef34972729fc997715e96c0f4d482994da`. The existing private backup checksum/permissions and unchanged predecessor public rows were reverified before writes.
- CMS OpenNext production build/deploy completed; exact version readback: `123ffb17-1b7a-40a4-ac65-1b63f11c1dc2`. Real browser verifies CMS topics API has 23 with no further pages, site service-binding reads have 21 speakers and approved 2-person team, both live. Eventbrite remains 23 stale cached events with `eventbrite-http-429`; no recovery claimed.
- Fresh independent gates: root 109 tests, Payload Access/media 15 tests, lint, frontend/Worker/Payload types, production frontend build passed. Additional Payload API suite: 7 passed using `PAYLOAD_BUILD=true PAYLOAD_SECRET=isolated-release-test-only DOTENV_CONFIG_PATH=/dev/null`, which selects local-only nonpersistent bindings. Payload lint has 8 unchanged migration warnings. No live lead/signup test performed.
- Local pnpm 11 automatic dependency verification interrupted OpenNext commands. Used command-scoped `pnpm_config_verify_deps_before_run=false` with installed dependencies, not changed production configuration. Removed pnpm's incidental workspace-policy placeholders. Full OpenNext build then normal deploy succeeded. Expected bundled-dependency eval/nullish warnings remain.
- Previous production frontend exposed no GA measurement ID. Production builds unset `VITE_DISABLE_ANALYTICS`; optional analytics behavior remains, not a promise of GA emission.

Site activation, Git publication and final live route checks are pending at this checkpoint. Parent owns task closure.

The user explicitly approved using reviewed preview content, including the 12 changed existing speaker portraits and one team description, adding 8 speakers and 23 topics, and copying the 20 referenced portraits to NEW immutable production R2 keys. Preserve matched production IDs, old records/assets and exact source-to-target mapping. No source cleanup or subscriber migration. Prior merge/push/deploy approval remains valid. Historical conflict/authentication gates below are superseded. Production completion is not yet claimed; isolated mapping/import, deployment and live readback remain required.

Latest continuation, 2026-11-09 UTC: normal Wrangler OAuth is working. The older authentication blocker below is resolved. Release remains authorized, but **not deployed**. No commit, push, PR, merge, production schema/data change, provider write, media upload or deployment was made in this continuation. Do not push auto-deploying main until the content conflict described below is resolved. Task closure remains parent-owned.

### Verified production owner and runtime

- Explicit read-only discovery against both accounts proves LAD account `adc3c121900eb74bc000b7fdaf57987e` owns both Workers and both configured D1 databases. The personal account returns an empty D1 list and Worker-not-found for both names. Use `CLOUDFLARE_ACCOUNT_ID=adc3c121900eb74bc000b7fdaf57987e` for subsequent Wrangler operations.
- `git fetch origin` succeeded; HEAD and origin/main remain `e40fd8d29b715a33280e01a4804c1cf366ed8eab`. `gh workflow list` returned no Actions workflows. CLAUDE.md documents Workers Builds on main; no main push was attempted.
- Prior/current site version: `e57a9c56-71bb-49cb-a25c-7c2d5abfd51f`. Prior/current CMS version: `9f3e2050-ae41-4e76-83a6-ea60d8470b71`. Deployment lists and exact version reads verified both.
- Site secrets include `BREVO_API_KEY` and `NOTION_API_KEY`; only names/types were inspected. Exact version readback confirms public vars `BREVO_LIST_ID=2`, `SITE_URL=https://lecturesafterdark.ca`, the existing CMS service binding, KV, newsletter D1/queue/R2 and email binding.
- Only `CONTACT_RATE_LIMITER` is currently deployed. The two new limiter declarations are local and must be deployed/read back with the new app. No duplicate resources were provisioned. No credential files were opened. Secret presence is not proof of Brevo list permission or live Notion schema compatibility; these remain unverified.

### Preservation and actual content inventory

- Fresh allowlisted source snapshot: `/home/horisofine/project/redesign-integration-backups/release-auth-20261109T030231Z`, 181 source/asset/test files copied and SHA256-verified before new work. Excludes credential files, databases, dependencies and generated output. The snapshot reflects its explicit allowlist, not a complete worktree backup.
- Private production CMS D1 export: `/home/horisofine/project/redesign-integration-backups/release-auth-20261109T030231Z/production-cms.sql`. File existence, mode 0600 and hash verified; checksum is alongside it in `production-cms.sha256`. Backup directory is mode 0700. Never commit or print its contents. Newsletter DB was neither exported nor changed.
- Sanitized schemas, public content captures, reduced prior-version metadata and media manifest are in that same private directory. No user/API-key/subscriber rows were queried for the inventory.
- Production CMS has 13 speakers, 2 team members, 0 editorial events and 16 media records. Five recorded predecessor migrations end at `20261106_224114_mcp_api_keys`; no topics table exists yet.
- Actual preview sources are split: local Payload on port 3001 has 23 topics, 21 speakers, 21 media records, 0 events and 0 team members. Isolated Strapi on port 1437 has 23 published events and 2 team members. Pagination totals were checked. Read-only PostgreSQL aggregate independently confirms 23 events, all published, no nonempty descriptions/topics. Other editorial fields are empty in all 23 REST records; do not invent enrichment.
- All 23 unique topic source URLs match the 23 unique Strapi Eventbrite URLs exactly. Source categories are populated across all six supported categories.
- Of 21 preview speakers, 13 have exact-name production candidates whose topic/bio/social/order fields also match. Their numeric IDs are not interchangeable. Eight preview speakers have no production name match. Twelve of the existing candidates have different image values. Twenty preview speakers use `lad.houssamrighi.com` image URLs; one already uses production media.
- Downloaded those 20 referenced images read-only from local Payload into memory, checked metadata byte sizes and computed 20 distinct content hashes. Manifest: `preview-media-manifest.json`. No media uploaded or source image changed. The additional unreferenced media record is not deleted or assumed disposable.
- One team record matches completely; source team ID 2 matches production ID 3 by name but has a **different description**. This is an actual overwrite decision, not a missing schema.

### Concrete release blocker

The content transfer has not been approved at the field-conflict level. Confirm whether the reviewed preview should replace the 12 existing speaker portraits and the differing team description, and authorize copying the 20 referenced preview images into production R2 with new immutable keys. Retain production IDs for existing speakers/team and establish a reviewed source-to-target ID manifest; add the 8 new preview speakers and 23 topics without deleting current records. Do not infer identity from equal numeric IDs, overwrite existing content silently, or make production depend on the preview hostname.

Until this conflict is resolved, the production import and CMS-first activation remain paused. This is not a renewed request for merge/deploy permission. The user already granted that permission. Brevo list identity/permissions and Notion destination schemas still need authorized read-only verification; current Cloudflare secret names cannot prove them. No arbitrary lead/signup fixture was created.

### Fresh verification after OAuth restoration

- `node .tests/release-full-d1.mjs /home/horisofine/project/redesign-integration-backups/release-auth-20261109T030231Z "$TMPDIR/lad-release-full-d1"`: passed. New probe lives only under ignored `.tests/`. Built a fresh local D1 from all 73 production schema objects, applied all 15 additive up-statements, preserved every original field of 13 speaker / 2 team / 0 event / 16 media public rows, and passed foreign-key checks. Private/auth predecessor rows deliberately excluded.
- Same probe imported the 23 captured topics into isolated D1, read canonical fields back, then repeated the import. Exact values/count/hash remained unchanged. Summary and local state: `/home/horisofine/.hermes/profiles/senior-fullstack/cache/scratch/lad-release-full-d1/`. This validates full-schema local D1 SQL and topics only, not Payload API/E2E, speaker/media transfer, or live migration.
- `npm test`: **109 passed, 0 failed**. `npm run lint`, `./node_modules/.bin/tsc -b`, `npm run type-check:worker`, `git diff --check`: passed.
- `DOTENV_CONFIG_PATH=/dev/null npm --prefix payload run test:int -- ../.tests/payload/int/cloudflare-access.int.spec.ts ../.tests/payload/int/media-url.int.spec.ts`: **15 passed**. Full DB-backed API and E2E suites remain unrun.
- `env -u VITE_DISABLE_ANALYTICS npm run build -- --outDir .wrangler/release-production-dist`: passed, production mode, 1810 modules. Uses normal optional analytics configuration, not the preview-only disable. Does not replace the served `dist` preview. Actual production analytics build variable remains to be verified in Workers Builds.
- Payload `lint` and `type-check`: passed, lint retains 8 pre-existing migration warnings. `DOTENV_CONFIG_PATH=/dev/null npm --prefix payload run build`: optimized Next webpack build passed. This is not an OpenNext deployed bundle or remote DB test.
- `cmp worker/brevo-signup.ts /home/horisofine/project/worktrees/lad-website-redesign/worker/brevo-signup.ts`: passed. Independent read-only Brevo/entry/routes review found no concrete blocker; its targeted suite passed 21 tests. It did not verify live providers or full release quality gates.
- Browser GETs to existing production independently returned: events 23 with `stale-cache` / `eventbrite-http-429`; speakers 13 live; team 2 live; topics HTTP 200 **HTML**, not a topics API. Terminal public HTTP probes returned 403 but browser succeeded. No upstream freshness recovery or redesign deployment is claimed.

### Safe next actions and rollback

Resolve the field-conflict/media-copy decision, review the complete ID/asset mapping, and complete isolated import/readback/idempotency checks for speakers/team/media before production changes. Verify provider/config readiness, complete production-shaped browser and independent release reviews, then commit explicit reviewed files and deploy validated additive CMS/schema/data before site activation. Both main auto-builds must be ordered deliberately; do not rely on a simultaneous main push. Ignored tests remain absent from fresh clones/CI; do not force-add them or recreate tracked `tests/`.

If a later application deployment regresses, roll back only the affected app to the recorded version with the LAD account explicitly selected, for example `CLOUDFLARE_ACCOUNT_ID=adc3c121900eb74bc000b7fdaf57987e ./node_modules/.bin/wrangler rollback e57a9c56-71bb-49cb-a25c-7c2d5abfd51f --name lectures-after-dark`; use CMS version `9f3e2050-ae41-4e76-83a6-ea60d8470b71` for `lectures-after-dark-cms`. Verify version/status and content after rollback. Do not run the destructive down migration or restore over newer data. No rollback is needed now because no app/schema/data cutover occurred.

## Historical pre-authentication notes

The user authorized scoped commit, push, merge and deployment. That authorization remains valid; this stop is an authentication/readiness blocker, not a request for renewed release approval. No release commit, PR, push, merge, migration or deployment was performed by the resumed worker. Task closure remains parent-owned.

## Verified preflight (2026-11-09 UTC)

- Working branch: `task/redesign-integration` in `/home/horisofine/project/worktrees/lad-redesign-integration`.
- `git fetch origin` succeeded. HEAD and fetched origin/main both equal `e40fd8d29b715a33280e01a4804c1cf366ed8eab`.
- Existing GitHub CLI authentication works. npm and pnpm are available.
- `CI=true ./node_modules/.bin/wrangler whoami` (Wrangler 4.158.0) returned `You are not authenticated. Please run wrangler login.` Although its exit code was zero, its text does not establish authenticated readiness.
- Presence-only environment inspection found no CLOUDFLARE_API_TOKEN, CLOUDFLARE_API_KEY, CLOUDFLARE_EMAIL, CLOUDFLARE_ACCOUNT_ID, WRANGLER_HOME or XDG_CONFIG_HOME. No credential or dotenv file was opened. No login retry loop, temporary account or auth bypass was attempted.
- CLAUDE.md documents both Workers auto-deploying on main push, with the CMS migration preceding its build. Pushing main before CMS validation could therefore race the website deployment. No push attempted.
- Existing interrupted-worker snapshot located at `/home/horisofine/project/redesign-integration-backups/release-20261109T013312Z`. No prior release/preflight log was located in the inspected integration-results directory or current scratch directory. Historical implementation handoff and data-transfer report were read; their earlier no-release authorization text is superseded by the current user instruction.

## Preservation

New explicit-allowlist source snapshot: `/home/horisofine/project/redesign-integration-backups/release-resume-20261109T013630Z`.

200 copied files were SHA256-verified against source. The snapshot includes the ignored local test sources, excluding their node_modules symlink. It excludes credentials, databases, builds, runtime captures and dependencies. Manifest: `manifest.json` in that private directory. This is a source backup, NOT a production D1 backup.

The original source worktree, original preview, main worktree and original backup were not changed. No test paths were recreated or force-added. Existing tracked test deletions remain unstaged for the eventual explicit release commit.

## Fresh verification

- `npm test`: 97 passed, 0 failed, using `.tests/tsx-loader.mjs` and `.tests/*.test.mjs`.
- `DOTENV_CONFIG_PATH=/dev/null npm --prefix payload run test:int -- ../.tests/payload/int/cloudflare-access.int.spec.ts ../.tests/payload/int/media-url.int.spec.ts`: 15 passed across 2 files.
- `npm run lint`: passed.
- `git check-ignore .tests/tsx-loader.mjs .tests/payload/int/api.int.spec.ts`: both ignored as requested.

Raw logs are outside the worktree in the new snapshot directory as `root-tests.log`, `payload-auth-media.log`, and `lint.log`. Tests are intentionally absent from fresh clones/CI. No full DB-backed Payload suite, production-shaped browser check or delivery test is claimed by this preflight.

## Blocking dependency and resume requirements

Restore the existing Cloudflare login in this execution environment using the normal Wrangler authentication flow, or provide the existing authorized CLI environment privately. Do not send credentials in chat. The parent/user must complete any required interactive authentication; the worker must then verify whoami before continuing.

Until authenticated access is available, live secret names/bindings, Brevo list identity, deployed app versions, D1 schema/content inventory and private production backup cannot be verified. Thus no safe CMS-first release can be completed.

Remaining release work is not represented as complete: verify the locally configured limiter namespaces against the authenticated account; inventory and preserve source topics/editorial/media; perform full predecessor isolated D1 migration/dry-run/hash/idempotency checks; back up production D1; record prior versions; run complete gates and independent reviews; then commit explicit files, follow PR checks and safely deploy CMS before site activation. Do not infer list 2 availability from configuration or fixtures. No real subscription, lead or Notion write is authorized as a test.

## Local Brevo completion (2026-11-09 UTC)

Local implementation continued without Cloudflare authentication, as explicitly requested. No commit, push, deployment, migration, live provider write, provisioning, or credential-file read occurred.

- Ported `worker/brevo-signup.ts` byte-for-byte from the read-only original redesign; `cmp` passed. The production entry now handles exactly `/api/newsletter/subscribe` before the legacy newsletter router. Method/origin/body/consent/honeypot/rate-limit checks and bounded Brevo calls remain intact.
- Preserved non-enumerating acknowledgements, global blacklist and target-list unsubscribe safeguards, safe duplicate list-add by contact ID, provider detail validation, and no automatic retry. Legacy confirm/unsubscribe/admin, queues, feedback, stored data and bindings remain intact. This does not reconcile legacy D1 suppressions with Brevo; any future subscriber transfer must separately preserve those suppressions.
- Frontend submits email, explicit consent and honeypot through the shared acknowledgement-validating helper without Turnstile. It resets only after a valid acknowledgement. Privacy text now distinguishes direct Brevo signup from retained legacy records; it does not promise double opt-in, welcome delivery, or a persisted new consent audit record. Independent Brevo account automations are unverified.
- `BREVO_LIST_ID = "2"` remains unchanged. After inspecting existing TOML, added separate `NEWSLETTER_RATE_LIMITER` (`24873191`) and `PARTICIPATION_RATE_LIMITER` (`24873192`) configurations, each 5 requests per 60 seconds. Existing contact namespace `24873190` is unchanged. These are local declarations, not live provisioning or verified account-wide namespace availability. Existing legacy Turnstile settings are retained for their consumers, not required by Brevo signup.
- All local suites remain in ignored `.tests/`, with root `.tests/tsx-loader.mjs` and Payload `.tests/payload`. Fresh clones/CI do not contain these intentionally untracked suites.

### Actual verification

- TDD: changed production-routing, client-contract and rendered-copy tests failed first (3 failures), then passed after integration.
- Targeted Brevo/client/render/entry suite: 17 passed; additional form-submit regression passed, exercising acknowledgement versus malformed response with a fixture fetch and no browser Turnstile. Legacy confirmation, unsubscribe and feedback-unsubscribe invalid-token redirects plus admin denial remain reachable.
- Final `npm test`: **109 passed, 0 failed**. Log: `docs/integration-results/brevo-root-tests.log` (ignored local log). Includes provider rejection/network failure, streamed size bounds, duplicate/list/suppression cases and retired route regressions.
- `npm run lint`: passed.
- `./node_modules/.bin/tsc -b`: passed (frontend/project types).
- `npm run type-check:worker`: passed.
- `VITE_DISABLE_ANALYTICS=true npm run build -- --mode preview --outDir .wrangler/brevo-review-dist`: passed, Vite 7.3.0, 1810 modules. Existing served `dist` and preview process were not replaced; build is isolated and analytics-disabled.
- `DOTENV_CONFIG_PATH=/dev/null npm --prefix payload run test:int -- ../.tests/payload/int/cloudflare-access.int.spec.ts ../.tests/payload/int/media-url.int.spec.ts`: **15 passed across 2 files**. Full DB-backed Payload suites were not run.
- `git diff --check` and ignore checks for root loader, Brevo suite and Payload suite passed. Node emitted its expected experimental module-mocking warnings.

No browser/live delivery test is claimed by this local pass. Cloudflare authentication, runtime secret/binding readback, Brevo list identity/access, provider automation review, production backup, full-predecessor D1 migration/data validation, curated content preservation, and combined release review remain gates. `BREVO_API_KEY` must stay a server secret. No arbitrary real subscription or lead submission is authorized for testing.

## Production identifiers and rollback

New production SHA/version/PR: none. Previous Cloudflare versions: not retrievable without authenticated access. Production schema/data counts and D1 backup: not verified, not zero. No rollback is needed because this worker made no production changes. Before a later deployment, record both prior app versions and use only app-version rollback for regressions; leave additive schema and data intact.

Production target remains https://lecturesafterdark.ca. The existing review preview is http://127.0.0.1:4188 (read-only captures, not delivery proof); its process was not restarted or modified by this worker.
