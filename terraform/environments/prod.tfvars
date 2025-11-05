environment = "prod"
aws_region  = "us-east-1"

vpc_cidr           = "10.2.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

enable_nat_gateway = true
single_nat_gateway = false

enable_ecs         = true
enable_lambda      = true
enable_cloudfront  = true
enable_api_gateway = true

rds_instance_class    = "db.t3.medium"
rds_allocated_storage = 100
rds_engine_version    = "15.4"

elasticache_node_type       = "cache.t3.medium"
elasticache_num_cache_nodes = 3

db_name     = "portfolio_prod"
db_username = "admin"

tags = {
  CostCenter = "production"
  Owner      = "devops-team"
}
