variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name used as a prefix for all resource names"
  type        = string
  default     = "axiom"
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "domain" {
  description = "Primary domain for the application (e.g. axiom.saswat.app or saswat.app)"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key content (or path) to install on EC2 instances for admin access"
  type        = string
}

variable "your_ip_cidr" {
  description = "Your public IP CIDR for SSH access to k3s nodes (e.g. 1.2.3.4/32)"
  type        = string
}

variable "db_password" {
  description = "Master password for the RDS PostgreSQL instance"
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "Auth token for ElastiCache Redis (min 16 chars)"
  type        = string
  sensitive   = true
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
  description = "API key for DeepSeek AI (used by the AI microservice)"
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

variable "razorpay_plan_monthly" {
  description = "Razorpay plan ID for monthly subscription"
  type        = string
  default     = ""
}

variable "razorpay_plan_quarterly" {
  description = "Razorpay plan ID for quarterly subscription"
  type        = string
  default     = ""
}

variable "razorpay_plan_annual" {
  description = "Razorpay plan ID for annual subscription"
  type        = string
  default     = ""
}

variable "aws_s3_bucket" {
  description = "S3 bucket name for storing resume files"
  type        = string
  default     = "axiom-resumes-prod"
}

variable "ses_email" {
  description = "Verified SES sender address"
  type        = string
  default     = "noreply@saswat.app"
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS on the ALB (must be in us-east-1)"
  type        = string
}

variable "k3s_token" {
  description = "Shared secret token for k3s cluster authentication between control plane and workers"
  type        = string
  sensitive   = true
}
