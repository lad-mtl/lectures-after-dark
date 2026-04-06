#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(pwd)}"
DEPLOY_REMOTE="${DEPLOY_REMOTE:-origin}"
DEPLOY_REF="${DEPLOY_REF:-main}"
SERVICE_NAME="${SERVICE_NAME:-lectures-after-dark-strapi}"
PNPM_BIN="${PNPM_BIN:-$(command -v pnpm)}"
SYSTEMCTL_BIN="${SYSTEMCTL_BIN:-$(command -v systemctl)}"

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  echo "Repository not found at ${REPO_ROOT}" >&2
  exit 1
fi

if [[ -z "${PNPM_BIN}" ]]; then
  echo "pnpm is not available on this host" >&2
  exit 1
fi

if [[ -z "${SYSTEMCTL_BIN}" ]]; then
  echo "systemctl is not available on this host" >&2
  exit 1
fi

cd "${REPO_ROOT}"

git fetch "${DEPLOY_REMOTE}" "${DEPLOY_REF}"

target_ref="${DEPLOY_REMOTE}/${DEPLOY_REF}"
target_head="$(git rev-parse "${target_ref}")"
current_head="$(git rev-parse HEAD)"
worktree_dirty="$(git status --porcelain)"

if [[ "${current_head}" == "${target_head}" ]]; then
  if [[ -n "${worktree_dirty}" ]]; then
    git reset --hard "${target_ref}"
  fi

  if sudo -n "${SYSTEMCTL_BIN}" is-active --quiet "${SERVICE_NAME}"; then
    echo "Strapi is already running at ${target_ref} (${target_head})."
    exit 0
  fi

  sudo -n "${SYSTEMCTL_BIN}" start "${SERVICE_NAME}"
  sudo -n "${SYSTEMCTL_BIN}" --no-pager --full status "${SERVICE_NAME}"
  exit 0
fi

git checkout -B "${DEPLOY_REF}" "${target_ref}"
git reset --hard "${target_ref}"

"${PNPM_BIN}" install --frozen-lockfile
"${PNPM_BIN}" --dir strapi install --frozen-lockfile
"${PNPM_BIN}" --dir strapi run build

sudo -n "${SYSTEMCTL_BIN}" restart "${SERVICE_NAME}"
sudo -n "${SYSTEMCTL_BIN}" --no-pager --full status "${SERVICE_NAME}"
