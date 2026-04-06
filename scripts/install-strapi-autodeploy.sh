#!/usr/bin/env bash
set -euo pipefail

AUTODEPLOY_NAME="${AUTODEPLOY_NAME:-lectures-after-dark-strapi-autodeploy}"
REPO_ROOT="${REPO_ROOT:-$(pwd)}"
SERVICE_USER="${SERVICE_USER:-${SUDO_USER:-$USER}}"
STRAPI_SERVICE_NAME="${STRAPI_SERVICE_NAME:-lectures-after-dark-strapi}"
DEPLOY_REMOTE="${DEPLOY_REMOTE:-origin}"
DEPLOY_REF="${DEPLOY_REF:-main}"
CHECK_INTERVAL="${CHECK_INTERVAL:-2min}"
SERVICE_UNIT_PATH="${SERVICE_UNIT_PATH:-/etc/systemd/system/${AUTODEPLOY_NAME}.service}"
TIMER_UNIT_PATH="${TIMER_UNIT_PATH:-/etc/systemd/system/${AUTODEPLOY_NAME}.timer}"
NODE_BIN="${NODE_BIN:-$(command -v node)}"
NODE_DIR="$(dirname "${NODE_BIN}")"

usage() {
  cat <<EOF
Usage: sudo ./scripts/install-strapi-autodeploy.sh [options]

Creates or updates a systemd timer that checks origin/main and deploys Strapi
when the remote branch changes.

Options:
  --repo-root PATH          repository root on the Strapi host
  --service-user USER       user that owns the deployment checkout
  --strapi-service NAME     systemd service to restart
  --git-remote NAME         git remote to fetch (default: origin)
  --branch NAME             branch to deploy (default: main)
  --interval DURATION       systemd timer interval (default: 2min)
  --service-unit-path PATH  override generated service unit path
  --timer-unit-path PATH    override generated timer unit path
  -h, --help                show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-root)
      REPO_ROOT="$2"
      shift 2
      ;;
    --service-user)
      SERVICE_USER="$2"
      shift 2
      ;;
    --strapi-service)
      STRAPI_SERVICE_NAME="$2"
      shift 2
      ;;
    --git-remote)
      DEPLOY_REMOTE="$2"
      shift 2
      ;;
    --branch)
      DEPLOY_REF="$2"
      shift 2
      ;;
    --interval)
      CHECK_INTERVAL="$2"
      shift 2
      ;;
    --service-unit-path)
      SERVICE_UNIT_PATH="$2"
      shift 2
      ;;
    --timer-unit-path)
      TIMER_UNIT_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  echo "Repository not found at ${REPO_ROOT}" >&2
  exit 1
fi

cat >"${SERVICE_UNIT_PATH}" <<EOF
[Unit]
Description=Auto deploy Lectures After Dark Strapi from ${DEPLOY_REMOTE}/${DEPLOY_REF}
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=${SERVICE_USER}
WorkingDirectory=${REPO_ROOT}
Environment=PATH=${NODE_DIR}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=REPO_ROOT=${REPO_ROOT}
Environment=DEPLOY_REMOTE=${DEPLOY_REMOTE}
Environment=DEPLOY_REF=${DEPLOY_REF}
Environment=SERVICE_NAME=${STRAPI_SERVICE_NAME}
ExecStart=${REPO_ROOT}/scripts/deploy-strapi-main.sh
EOF

cat >"${TIMER_UNIT_PATH}" <<EOF
[Unit]
Description=Check ${DEPLOY_REMOTE}/${DEPLOY_REF} for Strapi deploy updates

[Timer]
OnBootSec=1min
OnUnitActiveSec=${CHECK_INTERVAL}
Unit=$(basename "${SERVICE_UNIT_PATH}")
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now "$(basename "${TIMER_UNIT_PATH}")"
systemctl start "$(basename "${SERVICE_UNIT_PATH}")"
systemctl --no-pager --full status "$(basename "${SERVICE_UNIT_PATH}")"
systemctl --no-pager --full status "$(basename "${TIMER_UNIT_PATH}")"
