#!/usr/bin/env bash
# Manual deploy from VPS (same steps GitHub Actions runs)
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy deploy/env.prod.example to .env first"
  exit 1
fi

set -a
source .env
set +a

: "${GHCR_IMAGE_PREFIX:?Set GHCR_IMAGE_PREFIX in .env}"
: "${IMAGE_TAG:=latest}"

if [[ -n "${GHCR_PULL_TOKEN:-}" ]]; then
  echo "$GHCR_PULL_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-$USER}" --password-stdin
fi

docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d --remove-orphans
docker image prune -f

echo "Deployed ${GHCR_IMAGE_PREFIX} tag ${IMAGE_TAG}"
