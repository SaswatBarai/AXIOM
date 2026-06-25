variable "project" {
  description = "Project name used as the secret name prefix"
  type        = string
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host address)"
  type        = string
}

variable "redis_endpoint" {
  description = "ElastiCache Redis endpoint address"
  type        = string
}

variable "jwt_secret_key" {
  description = "Secret key for signing JWT access tokens"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "Secret key for signing JWT refresh tokens"
  type        = string
  sensitive   = true
}

variable "ai_service_secret" {
  description = "Shared secret for authenticating requests to the AI microservice"
  type        = string
  sensitive   = true
}

variable "deepseek_api_key" {
  description = "API key for DeepSeek AI"
  type        = string
  sensitive   = true
}

variable "razorpay_key_id" {
  description = "Razorpay API key ID"
  type        = string
  sensitive   = true
}

variable "razorpay_key_secret" {
  description = "Razorpay API key secret"
  type        = string
  sensitive   = true
}

variable "razorpay_webhook_secret" {
  description = "Razorpay webhook signing secret"
  type        = string
  sensitive   = true
}

variable "ses_smtp_user" {
  description = "IAM access key ID for SES SMTP (axiom-ses-smtp user)"
  type        = string
  sensitive   = true
}

variable "ses_smtp_pass" {
  description = "SES SMTP password v4 derived from axiom-ses-smtp IAM access key"
  type        = string
  sensitive   = true
}

variable "aws_s3_bucket" {
  description = "S3 bucket name for resume file storage"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "domain" {
  description = "Primary application domain (e.g. saswat.app)"
  type        = string
}

variable "db_password" {
  description = "RDS database master password (used to construct DATABASE_URL)"
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "ElastiCache Redis auth token (used to construct REDIS_URL)"
  type        = string
  sensitive   = true
}
