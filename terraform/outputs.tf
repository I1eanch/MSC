output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.db_name
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.redis_endpoint
  sensitive   = true
}

output "media_bucket_name" {
  description = "S3 media bucket name"
  value       = module.s3.media_bucket_id
}

output "static_bucket_name" {
  description = "S3 static content bucket name"
  value       = module.s3.static_bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cloudfront ? module.cloudfront[0].cloudfront_distribution_id : null
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cloudfront ? module.cloudfront[0].cloudfront_domain_name : null
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = var.enable_ecs ? module.ecs[0].ecs_cluster_name : null
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = var.enable_ecs ? module.ecs[0].ecs_cluster_arn : null
}

output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = var.enable_api_gateway ? module.api_gateway[0].api_gateway_url : null
}

output "lambda_function_names" {
  description = "Lambda function names"
  value       = var.enable_lambda ? module.lambda[0].lambda_function_names : []
}

output "sns_topics" {
  description = "SNS topic ARNs"
  value       = module.messaging.sns_topic_arns
}

output "sqs_queues" {
  description = "SQS queue URLs"
  value       = module.messaging.sqs_queue_urls
}

output "db_password_secret_arn" {
  description = "ARN of the database password secret in Secrets Manager"
  value       = module.secrets.db_password_secret_arn
  sensitive   = true
}
