#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-lectures-after-dark-strapi}"
REPO_ROOT="${REPO_ROOT:-$(pwd)}"
STRAPI_ROOT="${STRAPI_ROOT:-${REPO_ROOT}/strapi}"
SERVICE_USER="${SERVICE_USER:-${SUDO_USER:-$USER}}"
SERVICE_PORT="${SERVICE_PORT:-1337}"
HOST_BIND="${HOST_BIND:-0.0.0.0}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"
BUILD_STRAPI="${BUILD_STRAPI:-1}"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/.env.strapi.service}"
UNIT_PATH="${UNIT_PATH:-/etc/systemd/system/${SERVICE_NAME}.service}"
NODE_BIN="${NODE_BIN:-$(command -v node)}"
PNPM_BIN="${PNPM_BIN:-$(command -v pnpm)}"
NODE_DIR="$(dirname "${NODE_BIN}")"

usage() {
  cat <<EOF
Usage: sudo ./scripts/install-strapi-systemd.sh [options]

Creates or updates a systemd service that runs Strapi for this repo.

Options:
  --repo-root PATH       repository root (default: current directory)
  --strapi-root PATH     Strapi app directory (default: <repo-root>/strapi)
  --service-name NAME    systemd service name (default: lectures-after-dark-strapi)
  --service-user USER    user for the service (default: current sudo user)
  --host HOST            Strapi host bind (default: 0.0.0.0)
  --port PORT            Strapi port (default: 1337)
  --env-file PATH        env file to load in systemd (default: .env.strapi.service)
  --unit-path PATH       systemd unit path override
  --skip-install         do not run pnpm install before creating the service
  --skip-build           do not run pnpm strapi:build before creating the service
  -h, --help             show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-root)
      REPO_ROOT="$2"
      STRAPI_ROOT="${STRAPI_ROOT:-${REPO_ROOT}/strapi}"
      ENV_FILE="${ENV_FILE:-${REPO_ROOT}/.env.strapi.service}"
      shift 2
      ;;
    --strapi-root)
      STRAPI_ROOT="$2"
      shift 2
      ;;
    --service-name)
      SERVICE_NAME="$2"
      UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
      shift 2
      ;;
    --service-user)
      SERVICE_USER="$2"
      shift 2
      ;;
    --host)
      HOST_BIND="$2"
      shift 2
      ;;
    --port)
      SERVICE_PORT="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --unit-path)
      UNIT_PATH="$2"
      shift 2
      ;;
    --skip-install)
      INSTALL_DEPS="0"
      shift
      ;;
    --skip-build)
      BUILD_STRAPI="0"
      shift
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

if [[ ! -d "${STRAPI_ROOT}" ]]; then
  echo "Strapi root not found: ${STRAPI_ROOT}" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Environment file not found: ${ENV_FILE}" >&2
  exit 1
fi

if [[ "${INSTALL_DEPS}" == "1" ]]; then
  "${PNPM_BIN}" --dir "${STRAPI_ROOT}" install
fi

if [[ "${BUILD_STRAPI}" == "1" ]]; then
  "${PNPM_BIN}" --dir "${STRAPI_ROOT}" run build
fi

cat >"${UNIT_PATH}" <<EOF
[Unit]
Description=Lectures After Dark Strapi
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${STRAPI_ROOT}
Environment=PATH=${NODE_DIR}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=HOST=${HOST_BIND}
Environment=PORT=${SERVICE_PORT}
EnvironmentFile=${ENV_FILE}
ExecStart=${PNPM_BIN} run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"

if systemctl is-active --quiet "${SERVICE_NAME}"; then
  systemctl restart "${SERVICE_NAME}"
else
  systemctl start "${SERVICE_NAME}"
fi

systemctl --no-pager --full status "${SERVICE_NAME}"
