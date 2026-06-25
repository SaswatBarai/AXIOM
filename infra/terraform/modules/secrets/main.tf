# ─────────────────────────────────────────────────────────────────────────────
# AWS Secrets Manager — single JSON secret for all app secrets
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "axiom_prod" {
  name        = "${var.project}/${var.environment}"
  description = "All application secrets for ${var.project} ${var.environment}"

  recovery_window_in_days = 7

  tags = {
    Name = "${var.project}-${var.environment}-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "axiom_prod" {
  secret_id = aws_secretsmanager_secret.axiom_prod.id

  secret_string = jsonencode({
    # Database
    DATABASE_URL = "postgresql://axiom:${var.db_password}@${var.rds_endpoint}:5432/axiom?sslmode=verify-full&sslrootcert=/etc/ssl/rds/global-bundle.pem"

    # Redis — plain redis:// (no TLS on aws_elasticache_cluster)
    REDIS_URL = "redis://${var.redis_endpoint}:6379/0"

    # JWT
    JWT_SECRET_KEY     = var.jwt_secret_key
    JWT_REFRESH_SECRET = var.jwt_refresh_secret

    # AWS (S3 — uses same IAM role permissions via env)
    AWS_S3_BUCKET = var.aws_s3_bucket
    AWS_REGION    = var.aws_region

    # Email — AWS SES SMTP
    EMAIL_FROM    = "AXIOM <noreply@${var.domain}>"
    SES_SMTP_USER = var.ses_smtp_user
    SES_SMTP_PASS = var.ses_smtp_pass

    # AI service (internal cluster DNS)
    AI_SERVICE_URL    = "http://axiom-ai.axiom-${var.environment}.svc.cluster.local:8000"
    AI_SERVICE_SECRET = var.ai_service_secret

    # External APIs
    DEEPSEEK_API_KEY = var.deepseek_api_key

    # URLs
    FRONTEND_URL      = "https://axiom.${var.domain}"
    API_PUBLIC_URL    = "https://axiom.${var.domain}/api"
    NEXT_PUBLIC_API_URL = "https://axiom.${var.domain}/api"
  })
}
