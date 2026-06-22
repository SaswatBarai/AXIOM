# AXIOM — Production Deployment Plan

**Chosen Stack:** Kubernetes (k3s on AWS EC2) + AWS Managed Data Layer + GitHub Actions CI/CD + Terraform IaC

> Running k3s on EC2 inside the same VPC gives private access to RDS and ElastiCache
> without a VPN — the cleanest hybrid of K8s control + AWS managed services.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Internet                                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
              ┌────────────────┐
              │  Cloudflare    │  DNS + CDN + DDoS protection (free)
              └────────┬───────┘
                       ↓  HTTPS
              ┌────────────────┐
              │  ACM Cert      │  *.yourdomain.com  (AWS, free)
              └────────┬───────┘
                       ↓
              ┌────────────────┐
              │  AWS ALB       │  Application Load Balancer
              │  (public)      │  terminates SSL, forwards HTTP
              └────────┬───────┘
                       ↓  Port 80 (plain HTTP inside cluster)
┌──────────────────────────────────────────────────────────────────────┐
│  AWS VPC  (10.0.0.0/16)                                             │
│                                                                      │
│  ┌───────────────────── Public Subnets (2 AZs) ─────────────────┐   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  k3s Cluster                                            │ │   │
│  │  │                                                         │ │   │
│  │  │  ┌──────────────────┐   ┌──────────────────────────┐   │ │   │
│  │  │  │ EC2 t3.medium    │   │ EC2 t3.small             │   │ │   │
│  │  │  │ Control Plane    │   │ Worker Node              │   │ │   │
│  │  │  │ (k3s server)     │   │ (k3s agent)              │   │ │   │
│  │  │  └──────────────────┘   └──────────────────────────┘   │ │   │
│  │  │                                                         │ │   │
│  │  │  Nginx Ingress Controller                               │ │   │
│  │  │  ├── axiom-web   (Next.js  :3000)  2 replicas          │ │   │
│  │  │  ├── axiom-api   (Express  :4000)  2 replicas          │ │   │
│  │  │  └── axiom-ai    (FastAPI  :8000)  1 replica           │ │   │
│  │  │                                                         │ │   │
│  │  │  cert-manager  (Let's Encrypt — staging + prod)        │ │   │
│  │  │  external-secrets (pulls from AWS Secrets Manager)     │ │   │
│  │  │  metrics-server  (HPA CPU/memory autoscaling)          │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────── Private Subnets (2 AZs) ────────────────┐   │
│  │                                                               │   │
│  │  RDS PostgreSQL 16      ElastiCache Redis 7                   │   │
│  │  db.t3.micro            cache.t3.micro                        │   │
│  │  pgvector extension     single-node                           │   │
│  │  encrypted at rest      encrypted in transit                  │   │
│  │  automated backups                                            │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  S3 Bucket: axiom-resumes      SES: email sending                   │
│  AWS Secrets Manager           ECR: 3 Docker repositories           │
│  CloudWatch: logs + metrics                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Full File Structure (to be created)

```
AXIOM/
├── infra/
│   └── terraform/
│       ├── main.tf                  # root module, provider config
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars.example
│       └── modules/
│           ├── networking/          # VPC, subnets, IGW, route tables, SGs
│           │   ├── main.tf
│           │   ├── variables.tf
│           │   └── outputs.tf
│           ├── compute/             # EC2 k3s nodes, key pair, IAM instance profile
│           │   ├── main.tf
│           │   ├── variables.tf
│           │   └── outputs.tf
│           ├── data/                # RDS, ElastiCache, subnet groups
│           │   ├── main.tf
│           │   ├── variables.tf
│           │   └── outputs.tf
│           ├── storage/             # S3 bucket, bucket policy, CORS
│           │   ├── main.tf
│           │   └── variables.tf
│           ├── email/               # SES domain, DKIM, identity
│           │   ├── main.tf
│           │   └── variables.tf
│           └── secrets/             # Secrets Manager secrets
│               ├── main.tf
│               └── variables.tf
│
├── k8s/
│   ├── namespaces.yaml              # axiom-prod, axiom-staging, monitoring
│   ├── base/
│   │   ├── web/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   ├── api/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   └── ai/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── hpa.yaml
│   ├── ingress/
│   │   ├── ingress.yaml             # Nginx ingress rules (all 3 apps)
│   │   └── clusterissuer.yaml       # cert-manager Let's Encrypt issuer
│   └── secrets/
│       └── external-secrets.yaml   # ExternalSecret CRDs → Secrets Manager
│
├── helm/
│   ├── axiom-api/
│   │   ├── Chart.yaml
│   │   ├── values.yaml              # default values
│   │   ├── values-prod.yaml         # prod overrides (image tag, replicas)
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── hpa.yaml
│   │       └── _helpers.tpl
│   ├── axiom-web/
│   │   └── ...                      # same structure
│   └── axiom-ai/
│       └── ...
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # PRs: lint + test + type-check
│       └── deploy.yml               # main: build → ECR → update Helm values → ArgoCD sync
│
└── apps/
    └── web/
        └── Dockerfile               # (to be created — Next.js doesn't have one yet)
```

---

## Terraform — What Each Module Provisions

### Module: networking
```hcl
aws_vpc                      "main"          # 10.0.0.0/16
aws_subnet                   "public_a/b"    # 10.0.1.0/24, 10.0.2.0/24
aws_subnet                   "private_a/b"   # 10.0.11.0/24, 10.0.12.0/24
aws_internet_gateway         "igw"
aws_route_table              "public"        # 0.0.0.0/0 → IGW
aws_security_group           "k3s_nodes"     # 22 from your IP, 80/443 from ALB, 6443 intra-cluster
aws_security_group           "alb"           # 80/443 from 0.0.0.0/0
aws_security_group           "rds"           # 5432 from k3s_nodes SG only
aws_security_group           "redis"         # 6379 from k3s_nodes SG only
```

### Module: compute
```hcl
aws_key_pair                 "axiom"         # your SSH public key
aws_iam_role                 "k3s_node"      # EC2 instance role
aws_iam_instance_profile     "k3s_node"
aws_iam_role_policy_attachment               # AmazonEC2ContainerRegistryReadOnly
                                             # AmazonS3FullAccess (scoped to axiom-resumes)
                                             # AmazonSESFullAccess
                                             # SecretsManagerReadWrite
aws_instance                 "control_plane" # t3.medium, Ubuntu 22.04
aws_instance                 "worker"        # t3.small,  Ubuntu 22.04
aws_eip                      "control"       # fixed public IP for kubeconfig
aws_lb                       "axiom"         # ALB
aws_lb_target_group          "web/api/ai"
aws_lb_listener              "https"         # forward to target groups by path
aws_acm_certificate          "wildcard"      # *.yourdomain.com
aws_route53_record           "validation"    # ACM DNS validation
```

### Module: data
```hcl
aws_db_subnet_group          "axiom"
aws_db_instance              "postgres"      # engine: postgres16, class: db.t3.micro
                                             # storage: 20 GB gp3, encrypted
                                             # publicly_accessible: false
                                             # skip_final_snapshot: false (prod)
aws_elasticache_subnet_group "axiom"
aws_elasticache_cluster      "redis"         # engine: redis7, node: cache.t3.micro
                                             # at_rest_encryption: true
                                             # transit_encryption: true
```

### Module: storage
```hcl
aws_s3_bucket                "axiom_resumes"
aws_s3_bucket_versioning                     # enabled
aws_s3_bucket_server_side_encryption_configuration  # AES-256
aws_s3_bucket_cors_configuration             # allow axiom domain
aws_s3_bucket_lifecycle_configuration        # delete incomplete multipart after 7d
aws_s3_bucket_public_access_block            # all public access blocked (presigned URLs only)
```

### Module: email (SES)
```hcl
aws_ses_domain_identity      "axiom"         # yourdomain.com
aws_ses_domain_dkim          "axiom"         # DKIM signing
aws_route53_record           "dkim × 3"      # DKIM DNS records
aws_route53_record           "mx"            # MX record for receiving (optional)
aws_ses_email_identity       "noreply"       # noreply@yourdomain.com
aws_iam_user                 "ses_smtp"      # SMTP user for SES
aws_iam_access_key           "ses_smtp"      # access key → Secrets Manager
```

### Module: secrets
```hcl
aws_secretsmanager_secret + version × 1:
  axiom/prod:
    DATABASE_URL        → postgres://...@rds-endpoint:5432/axiom
    REDIS_URL           → redis://redis-endpoint:6379
    JWT_SECRET_KEY      → (generated, 64 chars)
    JWT_REFRESH_SECRET  → (generated, 64 chars)
    AWS_ACCESS_KEY_ID   → (axiom-app IAM user)
    AWS_SECRET_ACCESS_KEY
    AWS_S3_BUCKET       → axiom-resumes
    AWS_REGION          → us-east-1
    SES_SMTP_USER       → (from ses_smtp IAM user)
    SES_SMTP_PASSWORD   → (from ses_smtp access key)
    EMAIL_FROM          → noreply@yourdomain.com
    AI_SERVICE_URL      → http://axiom-ai.axiom-prod.svc.cluster.local:8000
    AI_SERVICE_SECRET   → (generated)
    GOOGLE_AI_API_KEY   → (from user)
    RESEND_API_KEY      → (optional — SES replaces this)
```

---

## Kubernetes Manifests

### Namespaces
```yaml
# k8s/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: axiom-prod
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
```

### ExternalSecrets (pulls from Secrets Manager into k8s Secrets)
```yaml
# k8s/secrets/external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: axiom-secrets
  namespace: axiom-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: axiom-secrets
  dataFrom:
    - extract:
        key: axiom/prod
```

### Ingress
```yaml
# k8s/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: axiom-ingress
  namespace: axiom-prod
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [axiom.yourdomain.com]
      secretName: axiom-tls
  rules:
    - host: axiom.yourdomain.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: axiom-api, port: { number: 4000 } }
          - path: /ai
            pathType: Prefix
            backend:
              service: { name: axiom-ai, port: { number: 8000 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: axiom-web, port: { number: 3000 } }
```

### HPA (Horizontal Pod Autoscaler) — API example
```yaml
# k8s/base/api/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: axiom-api-hpa
  namespace: axiom-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: axiom-api
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## GitHub Actions CI/CD Pipeline

### ci.yml — runs on every Pull Request
```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @axiom/api typecheck
      - run: pnpm --filter @axiom/api test

  test-ai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r apps/ai/requirements.txt
      - run: pytest apps/ai/ -q

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
```

### deploy.yml — runs on push to main
```yaml
name: Deploy
on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com

jobs:
  # ── 1. Test (same as CI) ──────────────────────────────────────────────
  test:
    uses: ./.github/workflows/ci.yml

  # ── 2. Build & Push all 3 images ─────────────────────────────────────
  build-push:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.sha }}
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region:            ${{ env.AWS_REGION }}

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - id: meta
        run: echo "sha=${GITHUB_SHA::8}" >> $GITHUB_OUTPUT

      - name: Build & push axiom-web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: |
            ${{ env.ECR_REGISTRY }}/axiom-web:${{ steps.meta.outputs.sha }}
            ${{ env.ECR_REGISTRY }}/axiom-web:latest
          cache-from: type=registry,ref=${{ env.ECR_REGISTRY }}/axiom-web:latest
          cache-to:   type=inline

      - name: Build & push axiom-api
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          tags: |
            ${{ env.ECR_REGISTRY }}/axiom-api:${{ steps.meta.outputs.sha }}
            ${{ env.ECR_REGISTRY }}/axiom-api:latest
          cache-from: type=registry,ref=${{ env.ECR_REGISTRY }}/axiom-api:latest
          cache-to:   type=inline

      - name: Build & push axiom-ai
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/ai/Dockerfile
          push: true
          tags: |
            ${{ env.ECR_REGISTRY }}/axiom-ai:${{ steps.meta.outputs.sha }}
            ${{ env.ECR_REGISTRY }}/axiom-ai:latest
          cache-from: type=registry,ref=${{ env.ECR_REGISTRY }}/axiom-ai:latest
          cache-to:   type=inline

  # ── 3. Update Helm values → ArgoCD auto-syncs ────────────────────────
  deploy:
    needs: build-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_PAT }}   # PAT so push triggers ArgoCD

      - name: Update image tags in Helm values
        run: |
          TAG=${{ needs.build-push.outputs.image-tag }}
          sed -i "s/tag: .*/tag: ${TAG}/" helm/axiom-web/values-prod.yaml
          sed -i "s/tag: .*/tag: ${TAG}/" helm/axiom-api/values-prod.yaml
          sed -i "s/tag: .*/tag: ${TAG}/" helm/axiom-ai/values-prod.yaml

      - name: Commit & push updated tags
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add helm/*/values-prod.yaml
          git commit -m "chore: deploy ${{ needs.build-push.outputs.image-tag }} [skip ci]"
          git push

  # ── 4. Health check (ArgoCD sync takes ~60s) ─────────────────────────
  verify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Wait for ArgoCD sync
        run: sleep 90

      - name: Smoke test
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${{ secrets.DOMAIN }}/api/health)
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed: HTTP $STATUS"
            exit 1
          fi
          echo "Deploy verified: HTTP $STATUS"
```

---

## ArgoCD Application

```yaml
# infra/argocd/axiom-app.yaml  (applied once manually after ArgoCD install)
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: axiom
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - service: axiom-web
          - service: axiom-api
          - service: axiom-ai
  template:
    metadata:
      name: "{{service}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/your-org/axiom
        targetRevision: HEAD
        path: "helm/{{service}}"
        helm:
          valueFiles:
            - values.yaml
            - values-prod.yaml
      destination:
        server: https://kubernetes.default.svc
        namespace: axiom-prod
      syncPolicy:
        automated:
          prune:    true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
```

---

## AWS SES Configuration (email.service.ts changes)

SES replaces Resend. The service already has a nodemailer fallback — just point it at SES SMTP:

```
SMTP endpoint : email-smtp.us-east-1.amazonaws.com
SMTP port     : 587 (STARTTLS)
SMTP user     : SES SMTP credentials (from Terraform output)
SMTP password : SES SMTP credentials (from Terraform output)
EMAIL_FROM    : noreply@yourdomain.com
```

`email.service.ts` will use `nodemailer.createTransport({ host: SES_SMTP_HOST, port: 587 ... })` automatically when `RESEND_API_KEY` is not set.

---

## Helm Chart Structure (axiom-api example)

```yaml
# helm/axiom-api/Chart.yaml
apiVersion: v2
name: axiom-api
description: AXIOM API — Express 5 backend
version: 0.1.0
appVersion: "1.0"
```

```yaml
# helm/axiom-api/values.yaml
image:
  repository: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/axiom-api
  tag: latest
  pullPolicy: IfNotPresent

replicaCount: 2

resources:
  requests: { cpu: 100m, memory: 256Mi }
  limits:   { cpu: 500m, memory: 512Mi }

service:
  type: ClusterIP
  port: 4000

env:
  NODE_ENV: production
  PORT: "4000"

# secrets injected from ExternalSecret → k8s Secret
envFrom:
  - secretRef:
      name: axiom-secrets

livenessProbe:
  httpGet: { path: /api/health, port: 4000 }
  initialDelaySeconds: 15
  periodSeconds: 10

readinessProbe:
  httpGet: { path: /api/health, port: 4000 }
  initialDelaySeconds: 5
  periodSeconds: 5
```

```yaml
# helm/axiom-api/values-prod.yaml   ← CI updates this file's tag
image:
  tag: abc1234f   # 8-char git SHA — updated by GitHub Actions on every deploy
replicaCount: 2
```

---

## k3s Bootstrap Script (run by Terraform remote-exec)

```bash
#!/bin/bash
# Control plane
curl -sfL https://get.k3s.io | sh -s - \
  --disable traefik \
  --node-name control-plane \
  --tls-san <ELASTIC_IP>

# Get join token
cat /var/lib/rancher/k3s/server/node-token

# Worker (run on worker node)
curl -sfL https://get.k3s.io | K3S_URL=https://<CONTROL_IP>:6443 \
  K3S_TOKEN=<TOKEN> sh -s - --node-name worker-1

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Nginx Ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace \
  --set installCRDs=true

# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## Cost Breakdown

| Resource | Spec | $/month |
|---|---|---|
| EC2 t3.medium (control plane) | 2 vCPU / 4 GB | ~$30 |
| EC2 t3.small (worker) | 2 vCPU / 2 GB | ~$15 |
| RDS db.t3.micro PostgreSQL 16 | 1 vCPU / 1 GB, 20 GB gp3 | ~$15 |
| ElastiCache cache.t3.micro Redis 7 | 0.5 vCPU / 0.5 GB | ~$13 |
| ALB | per hour + LCU | ~$18 |
| S3 axiom-resumes | 10 GB + requests | ~$1 |
| ECR (3 repos) | storage + pull | ~$1 |
| SES email | <1000 emails/month | ~$0 |
| ACM wildcard cert | free | $0 |
| Route53 zone | $0.50/zone | ~$1 |
| CloudWatch logs | 5 GB/month | ~$3 |
| **Total** | | **~$97/month** |

> **Cost reduction**: Replace ALB with a k3s NodePort + Elastic IP + Nginx inside k3s (~$3/month) to cut $18. Also use `db.t3.micro` reserved instance (1-year) for 40% RDS discount.

---

## DevOps Skills This Demonstrates

| Skill | Where |
|---|---|
| **Terraform IaC** | All AWS resources — VPC, EC2, RDS, ElastiCache, S3, SES, ECR, Secrets Manager |
| **Kubernetes (k3s)** | Self-managed cluster setup from scratch on EC2 |
| **Helm chart authoring** | Custom charts for all 3 services (not just consuming upstream charts) |
| **GitOps (ArgoCD)** | No kubectl in CI — git push triggers sync |
| **GitHub Actions CI/CD** | 4-stage pipeline: test → build → push ECR → update Helm values |
| **Docker multi-stage builds** | All 3 Dockerfiles (web needs to be added) |
| **Nginx Ingress** | Path-based routing, rate limiting, SSL redirect |
| **cert-manager** | Automatic Let's Encrypt cert provisioning and renewal |
| **External Secrets** | Pulling AWS Secrets Manager into k8s Secrets — no secrets in git |
| **HPA autoscaling** | CPU + memory based scaling for API and web |
| **AWS managed services** | RDS, ElastiCache, S3, SES, ECR — proper separation of concerns |
| **Security** | Private subnets for data, SGs, IAM least-privilege, S3 block public access |
| **Observability** | CloudWatch logs + metrics (Prometheus/Grafana optional add-on) |

---

## Execution Order

```
Phase 1 — Prerequisites (30 min)
  1. Register domain (if not done)
  2. Create AWS account + IAM user for Terraform (AdministratorAccess for setup)
  3. Configure AWS CLI: aws configure
  4. Generate SSH key pair: ssh-keygen -t ed25519 -f ~/.ssh/axiom-prod
  5. Add GitHub secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT_ID, DOMAIN, GH_PAT

Phase 2 — Infrastructure (1 h)
  6. cd infra/terraform && terraform init
  7. cp terraform.tfvars.example terraform.tfvars  # fill in your values
  8. terraform plan
  9. terraform apply   # provisions VPC, EC2, RDS, ElastiCache, S3, SES, ECR, Secrets Manager

Phase 3 — k3s Cluster (30 min)
  10. SSH into control plane, run bootstrap script
  11. Copy /etc/rancher/k3s/k3s.yaml to local → update server IP
  12. kubectl get nodes   # verify both nodes Ready

Phase 4 — Kubernetes tooling (30 min)
  13. Install Nginx Ingress, cert-manager, External Secrets, ArgoCD (bootstrap script)
  14. Apply namespaces + ClusterSecretStore + ExternalSecret
  15. Apply ArgoCD ApplicationSet

Phase 5 — DNS (15 min)
  16. Point domain A record to ALB DNS name (from terraform output)
  17. Wait for cert-manager to issue Let's Encrypt cert (~2 min)

Phase 6 — First Deploy (10 min)
  18. Push to main → GitHub Actions runs full pipeline
  19. ArgoCD syncs → pods roll out
  20. curl https://yourdomain.com/api/health

Phase 7 — Database setup (15 min)
  21. SSH tunnel through EC2 → RDS
  22. pnpm --filter @axiom/database db:migrate
  23. Run pgvector: CREATE EXTENSION IF NOT EXISTS vector;
  24. Verify SES domain in AWS console (sandbox → production)
```

---

## Next Steps — Tell me which to generate first

Say **"start Terraform"**, **"start Dockerfiles"**, **"start GitHub Actions"**, or **"start Helm"** and I will write every file in full, ready to use.
