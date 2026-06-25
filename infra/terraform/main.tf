terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "axiom-terraform-state-833453046877"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ─────────────────────────────────────────────
# Networking
# ─────────────────────────────────────────────
module "networking" {
  source = "./modules/networking"

  project      = var.project
  environment  = var.environment
  your_ip_cidr = var.your_ip_cidr
  aws_region   = var.aws_region
}

# ─────────────────────────────────────────────
# Compute (EC2 + ALB + ECR)
# ─────────────────────────────────────────────
module "compute" {
  source = "./modules/compute"

  project             = var.project
  environment         = var.environment
  aws_region          = var.aws_region
  ssh_public_key      = var.ssh_public_key
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  sg_alb_id           = module.networking.sg_alb_id
  sg_k3s_nodes_id     = module.networking.sg_k3s_nodes_id
  acm_certificate_arn = var.acm_certificate_arn
  k3s_token           = var.k3s_token
}

# ─────────────────────────────────────────────
# Data (RDS PostgreSQL + ElastiCache Redis)
# ─────────────────────────────────────────────
module "data" {
  source = "./modules/data"

  project            = var.project
  environment        = var.environment
  private_subnet_ids = module.networking.private_subnet_ids
  sg_rds_id          = module.networking.sg_rds_id
  sg_redis_id        = module.networking.sg_redis_id
  db_password        = var.db_password
  redis_auth_token   = var.redis_auth_token
}

# ─────────────────────────────────────────────
# Storage (S3)
# ─────────────────────────────────────────────
module "storage" {
  source = "./modules/storage"

  project     = var.project
  environment = var.environment
  domain      = var.domain
}

# ─────────────────────────────────────────────
# Email (SES + Route53)
# ─────────────────────────────────────────────
module "email" {
  source = "./modules/email"

  project     = var.project
  environment = var.environment
  domain      = var.domain
}

# ─────────────────────────────────────────────
# Secrets Manager
# ─────────────────────────────────────────────
module "secrets" {
  source = "./modules/secrets"

  project              = var.project
  environment          = var.environment
  rds_endpoint         = module.data.rds_endpoint
  redis_endpoint       = module.data.redis_endpoint
  jwt_secret_key       = var.jwt_secret_key
  jwt_refresh_secret   = var.jwt_refresh_secret
  ai_service_secret    = var.ai_service_secret
  deepseek_api_key     = var.deepseek_api_key
  ses_smtp_user           = module.email.ses_smtp_user
  ses_smtp_pass           = module.email.ses_smtp_password
  razorpay_key_id         = var.razorpay_key_id
  razorpay_key_secret     = var.razorpay_key_secret
  razorpay_webhook_secret = var.razorpay_webhook_secret
  aws_s3_bucket        = var.aws_s3_bucket
  aws_region           = var.aws_region
  domain               = var.domain
  db_password          = var.db_password
  redis_auth_token     = var.redis_auth_token
}
