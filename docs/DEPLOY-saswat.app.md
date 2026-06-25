# Deploy AXIOM on saswat.app (subdomains)

Production layout for your domain:

| Host | Purpose |
|------|---------|
| `saswat.app` | Your portfolio (unchanged) |
| `axiom.saswat.app` | AXIOM web app + `/api` proxy |
| `api.axiom.saswat.app` | Direct API (OAuth callbacks, Razorpay webhooks) |

Stack: **Docker Compose + Caddy (HTTPS) + GitHub Actions → GHCR → VPS**

> The full Kubernetes/AWS plan in [DeploymentOptions.md](./DeploymentOptions.md) is for later scale-up. This guide ships faster on a single VPS (~$12–24/mo).

---

## 1. DNS (Namecheap / Cloudflare / wherever saswat.app is managed)

Add **A records** pointing to your VPS public IP:

```
axiom.saswat.app      →  YOUR_VPS_IP
api.axiom.saswat.app    →  YOUR_VPS_IP
```

Keep existing records for `saswat.app` / `www.saswat.app` pointing to your portfolio.

If using **Cloudflare**, set proxy to **DNS only** (grey cloud) for the first deploy so Caddy can obtain Let's Encrypt certificates. Re-enable proxy later if desired.

---

## 2. Provision the VPS

**Minimum:** 2 vCPU, 4 GB RAM, 40 GB disk (Ubuntu 22.04).

```bash
# On the VPS (as root)
git clone https://github.com/YOUR_USER/AXIOM.git /opt/axiom
cd /opt/axiom
sudo bash deploy/setup-server.sh
cp deploy/env.prod.example .env
nano .env   # fill all secrets
```

Set in `.env`:

```env
GHCR_IMAGE_PREFIX=ghcr.io/your-github-username/axiom
FRONTEND_URL=https://axiom.saswat.app
API_PUBLIC_URL=https://api.axiom.saswat.app
NEXT_PUBLIC_API_URL=https://axiom.saswat.app/api
ACME_EMAIL=you@saswat.app
```

Generate strong values for `JWT_SECRET_KEY`, `JWT_REFRESH_SECRET`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `AI_SERVICE_SECRET`.

---

## 3. GitHub repository secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `DEPLOY_HOST` | VPS IP or hostname |
| `DEPLOY_USER` | SSH user (e.g. `ubuntu` or `root`) |
| `DEPLOY_SSH_KEY` | Private SSH key (PEM) for deploy user |
| `GHCR_PULL_TOKEN` | GitHub PAT with `read:packages` scope |

### Create GHCR_PULL_TOKEN

1. GitHub → **Settings → Developer settings → Personal access tokens**
2. Fine-grained token: **read access to packages** for this repo
3. Paste as `GHCR_PULL_TOKEN`

### Package visibility

After first CI run, go to **Packages** on GitHub and ensure `axiom-api`, `axiom-web`, `axiom-ai` are visible to your account (private repos = private packages by default).

---

## 4. CI/CD workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `.github/workflows/ci.yml` | Pull requests | Lint, typecheck, test, verify Docker builds |
| `.github/workflows/deploy.yml` | Push to `main` | Build images → push to GHCR → SSH deploy to VPS |

Push to `main` to deploy:

```bash
git push origin main
```

Manual deploy: **Actions → Deploy → Run workflow**.

---

## 5. OAuth & Razorpay (production URLs)

Update provider dashboards:

**Google OAuth**

- Authorized redirect URI: `https://api.axiom.saswat.app/api/auth/google/callback`
- (or `https://axiom.saswat.app/api/auth/google/callback` — both work via Caddy)

**GitHub OAuth**

- Callback URL: `https://api.axiom.saswat.app/api/auth/github/callback`

**Razorpay**

- Webhook URL: `https://api.axiom.saswat.app/api/payments/webhook`
- Use **live** keys in production `.env`

---

## 6. First deploy (manual, optional)

Before GitHub Actions is wired:

```bash
cd /opt/axiom
export GHCR_IMAGE_PREFIX=ghcr.io/your-user/axiom
export IMAGE_TAG=latest
echo "$GHCR_PULL_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d
```

Check:

```bash
curl -s https://api.axiom.saswat.app/health
curl -sI https://axiom.saswat.app
```

---

## 7. Operations

```bash
# Logs
docker compose -f docker/docker-compose.prod.yml logs -f api

# Restart after .env change
docker compose -f docker/docker-compose.prod.yml up -d

# DB backup
docker exec axiom-prod-postgres-1 pg_dump -U axiom_user axiom > backup.sql
```

---

## 8. Upgrade path

When you outgrow a single VPS, migrate to the K8s/AWS architecture in [DeploymentOptions.md](./DeploymentOptions.md). The same Docker images in GHCR can be reused.

---

## Checklist before go-live

- [ ] DNS records propagated
- [ ] `.env` on VPS filled (no dev secrets)
- [ ] GitHub Actions secrets set
- [ ] OAuth redirect URLs updated
- [ ] Razorpay live keys + webhook registered
- [ ] Resend domain verified for `noreply@saswat.app`
- [ ] S3 bucket created for resumes
- [ ] `curl https://api.axiom.saswat.app/health` returns `"status":"ok"`
