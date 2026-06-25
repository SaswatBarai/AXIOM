#!/usr/bin/env bash
# One-time VPS bootstrap for AXIOM production.
# Run on Ubuntu 22.04+ as root or with sudo.
set -euo pipefail

APP_DIR=/opt/axiom
REPO_URL="${1:-}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/setup-server.sh <git-repo-url>"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git ufw

# Docker
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Firewall — allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "$APP_DIR"
if [[ -n "$REPO_URL" && ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/deploy/env.prod.example" "$APP_DIR/.env"
  echo ""
  echo "Created $APP_DIR/.env — edit secrets before first deploy."
fi

echo ""
echo "Server ready. Next steps:"
echo "  1. Edit $APP_DIR/.env (secrets, GHCR_IMAGE_PREFIX, domains)"
echo "  2. Point DNS: axiom.saswat.app + api.axiom.saswat.app → this server's IP"
echo "  3. Add GitHub secrets: DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY, GHCR_PULL_TOKEN"
echo "  4. Push to main branch to trigger deploy"
