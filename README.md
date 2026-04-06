# Lectures After Dark

Marketing site for Lectures After Dark.

## Stack

- Frontend: React 19 + Vite
- Edge layer: Cloudflare Workers
- CMS: self-hosted Strapi 5
- Content fallback cache: Cloudflare KV

## Local Development

Install dependencies once:

```bash
pnpm install
pnpm --dir strapi install
```

Run the frontend, Worker, and Strapi in separate terminals:

```bash
pnpm strapi:dev
pnpm workers:dev
pnpm dev
```

The public frontend reads content from `/api/content/*`, which Vite proxies to the local Worker. The Worker fetches Strapi content server-to-server from the configured Strapi REST API and can fall back to cached snapshots from KV.

## Worker Setup

The Worker expects these secrets/bindings:

- `STRAPI_CONTENT_API_URL`: Strapi REST API base URL used for public read queries
- `STRAPI_CONTENT_API_TOKEN`: optional bearer token if your Strapi host protects reads
- `STRAPI_TIMEOUT_MS`: optional upstream timeout override
- `CONTENT_CACHE`: KV namespace binding used for stale fallback responses

For a local Strapi instance, use:

```env
STRAPI_CONTENT_API_URL=http://127.0.0.1:1337/api
```

For local Worker development, Wrangler reads [`.dev.vars`](/Users/augusto.pinheiro/projects/lectures-after-dark/.dev.vars) automatically. The repo includes a local default and a copyable example:

```bash
cp .dev.vars.example .dev.vars
```

Public requests should flow through the Worker proxy instead of hitting Strapi directly from the browser.

## Strapi Setup

Seed data still lives in:

- `content/speakers/*.json`
- `content/venues/*.json`
- `content/faq/faq.json`

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
pnpm strapi:dev
pnpm strapi:build
pnpm strapi:start
pnpm strapi:seed
```

## Public Content Endpoints

The frontend reads normalized content from:

- `/api/content/speakers`
- `/api/content/venues`
- `/api/content/faq`

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
