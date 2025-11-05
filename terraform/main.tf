locals {
  common_tags = merge(
    var.tags,
    {
      Environment = var.environment
      Project     = var.project_name
    }
  )

  name_prefix = "${var.project_name}-${var.environment}"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway

  tags = local.common_tags
}

# Secrets Manager Module
module "secrets" {
  source = "./modules/secrets"

  name_prefix = local.name_prefix
  db_username = var.db_username

  tags = local.common_tags
}

# RDS PostgreSQL Module
module "rds" {
  source = "./modules/rds"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  instance_class     = var.rds_instance_class
  allocated_storage  = var.rds_allocated_storage
  engine_version     = var.rds_engine_version
  db_name            = var.db_name
  db_username        = var.db_username
  db_password_secret = module.secrets.db_password_secret_arn

  allowed_security_groups = concat(
    var.enable_ecs ? [module.ecs[0].ecs_security_group_id] : [],
    var.enable_lambda ? [module.lambda[0].lambda_security_group_id] : []
  )

  tags = local.common_tags
}

# ElastiCache Redis Module
module "elasticache" {
  source = "./modules/elasticache"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = var.elasticache_node_type
  num_cache_nodes    = var.elasticache_num_cache_nodes

  allowed_security_groups = concat(
    var.enable_ecs ? [module.ecs[0].ecs_security_group_id] : [],
    var.enable_lambda ? [module.lambda[0].lambda_security_group_id] : []
  )

  tags = local.common_tags
}

# S3 Buckets Module
module "s3" {
  source = "./modules/s3"

  name_prefix = local.name_prefix
  environment = var.environment

  tags = local.common_tags
}

# CloudFront CDN Module
module "cloudfront" {
  count  = var.enable_cloudfront ? 1 : 0
  source = "./modules/cloudfront"

  name_prefix              = local.name_prefix
  media_bucket_id          = module.s3.media_bucket_id
  media_bucket_arn         = module.s3.media_bucket_arn
  media_bucket_domain_name = module.s3.media_bucket_domain_name

  tags = local.common_tags
}

# ECS Module
module "ecs" {
  count  = var.enable_ecs ? 1 : 0
  source = "./modules/ecs"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  db_host            = module.rds.db_endpoint
  db_name            = var.db_name
  db_username        = var.db_username
  db_password_secret = module.secrets.db_password_secret_arn

  redis_endpoint = module.elasticache.redis_endpoint

  tags = local.common_tags
}

# Lambda Module
module "lambda" {
  count  = var.enable_lambda ? 1 : 0
  source = "./modules/lambda"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  db_host            = module.rds.db_endpoint
  db_name            = var.db_name
  db_username        = var.db_username
  db_password_secret = module.secrets.db_password_secret_arn

  redis_endpoint = module.elasticache.redis_endpoint

  tags = local.common_tags
}

# API Gateway Module
module "api_gateway" {
  count  = var.enable_api_gateway ? 1 : 0
  source = "./modules/api-gateway"

  name_prefix      = local.name_prefix
  environment      = var.environment
  lambda_functions = var.enable_lambda ? module.lambda[0].lambda_functions : {}

  tags = local.common_tags
}

# SNS/SQS Messaging Module
module "messaging" {
  source = "./modules/messaging"

  name_prefix = local.name_prefix
  environment = var.environment

  tags = local.common_tags
}
