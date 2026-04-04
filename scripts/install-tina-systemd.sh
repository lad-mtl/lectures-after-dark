#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-lectures-after-dark-tina}"
SERVICE_USER="${SERVICE_USER:-$(id -un)}"
SERVICE_GROUP="${SERVICE_GROUP:-$(id -gn)}"
SERVICE_PORT="${SERVICE_PORT:-4001}"
HOST_BIND="${HOST_BIND:-127.0.0.1}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"
BUILD_TINA="${BUILD_TINA:-1}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/.env.tina.service}"
PNPM_BIN="${PNPM_BIN:-}"
NODE_BIN="${NODE_BIN:-}"

usage() {
  cat <<EOF
Usage: sudo ./scripts/install-tina-systemd.sh [options]

Creates or updates a systemd service that runs TinaCMS for this repo.
If the service is already running, the script reloads the unit and restarts it.

Options:
  --service-name NAME   systemd unit name without .service
  --service-user USER   user that should run the service
  --service-group GROUP group that should run the service
  --repo-root PATH      repository root to run from
  --env-file PATH       environment file loaded by systemd
  --bind-host HOST      host bound by the Tina production server
  --tina-port PORT      Tina production port (default: 4001)
  --pnpm-bin PATH       absolute path to pnpm
  --node-bin PATH       absolute path to node
  --skip-install        do not run pnpm install before creating the service
  --skip-build          do not run pnpm tina:build before creating the service
  -h, --help            show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --service-name)
      SERVICE_NAME="$2"
      UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
      shift 2
      ;;
    --service-user)
      SERVICE_USER="$2"
      shift 2
      ;;
    --service-group)
      SERVICE_GROUP="$2"
      shift 2
      ;;
    --repo-root)
      REPO_ROOT="$2"
      ENV_FILE="${ENV_FILE:-${REPO_ROOT}/.env.tina.service}"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --bind-host)
      HOST_BIND="$2"
      shift 2
      ;;
    --tina-port)
      SERVICE_PORT="$2"
      shift 2
      ;;
    --pnpm-bin)
      PNPM_BIN="$2"
      shift 2
      ;;
    --node-bin)
      NODE_BIN="$2"
      shift 2
      ;;
    --skip-install)
      INSTALL_DEPS="0"
      shift
      ;;
    --skip-build)
      BUILD_TINA="0"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root so it can write the systemd unit." >&2
  exit 1
fi

if [[ ! -d "${REPO_ROOT}" ]]; then
  echo "Repository root not found: ${REPO_ROOT}" >&2
  exit 1
fi

if [[ -z "${PNPM_BIN}" ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_BIN="$(command -v pnpm)"
  elif [[ -x "/root/.nvm/versions/node/$(ls /root/.nvm/versions/node 2>/dev/null | sort -V | tail -n1)/bin/pnpm" ]]; then
    PNPM_BIN="/root/.nvm/versions/node/$(ls /root/.nvm/versions/node 2>/dev/null | sort -V | tail -n1)/bin/pnpm"
  else
    echo "Could not find pnpm. Pass --pnpm-bin /absolute/path/to/pnpm." >&2
    exit 1
  fi
fi

if [[ -z "${NODE_BIN}" ]]; then
  if command -v node >/dev/null 2>&1; then
    NODE_BIN="$(command -v node)"
  else
    NODE_BIN="$(dirname "${PNPM_BIN}")/node"
  fi
fi

if [[ ! -x "${PNPM_BIN}" ]]; then
  echo "pnpm is not executable: ${PNPM_BIN}" >&2
  exit 1
fi

if [[ ! -x "${NODE_BIN}" ]]; then
  echo "node is not executable: ${NODE_BIN}" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  cat > "${ENV_FILE}" <<EOF
# Tina systemd environment file
# Fill in the values below before relying on the service.
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_PERSONAL_ACCESS_TOKEN=
KV_REST_API_URL=
KV_REST_API_TOKEN=
NEXTAUTH_SECRET=
EOF
  chmod 600 "${ENV_FILE}"
  echo "Created ${ENV_FILE}. Fill it in before exposing the service publicly."
fi

if [[ "${INSTALL_DEPS}" == "1" ]]; then
  runuser -u "${SERVICE_USER}" -- env PATH="$(dirname "${NODE_BIN}"):${PATH}" \
    "${PNPM_BIN}" --dir "${REPO_ROOT}" install
fi

if [[ "${BUILD_TINA}" == "1" ]]; then
  runuser -u "${SERVICE_USER}" -- env PATH="$(dirname "${NODE_BIN}"):${PATH}" \
    "${PNPM_BIN}" --dir "${REPO_ROOT}" run tina:build
fi

cat > "${UNIT_PATH}" <<EOF
[Unit]
Description=Lectures After Dark TinaCMS
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_GROUP}
WorkingDirectory=${REPO_ROOT}
EnvironmentFile=-${ENV_FILE}
Environment=PATH=$(dirname "${NODE_BIN}"):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=TINA_HOST=${HOST_BIND}
Environment=TINA_PORT=${SERVICE_PORT}
ExecStart=${NODE_BIN} ${REPO_ROOT}/scripts/tina-production-server.mjs
Restart=always
RestartSec=5
TimeoutStartSec=120
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"

if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
  systemctl restart "${SERVICE_NAME}.service"
else
  systemctl start "${SERVICE_NAME}.service"
fi

systemctl --no-pager --full status "${SERVICE_NAME}.service" || true

echo
echo "Installed ${SERVICE_NAME}.service"
echo "Unit: ${UNIT_PATH}"
echo "Env : ${ENV_FILE}"
echo "Logs: journalctl -u ${SERVICE_NAME}.service -f"
