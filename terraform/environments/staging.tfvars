environment = "staging"
aws_region  = "us-east-1"

vpc_cidr           = "10.1.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

enable_nat_gateway = true
single_nat_gateway = false

enable_ecs         = true
enable_lambda      = true
enable_cloudfront  = true
enable_api_gateway = true

rds_instance_class    = "db.t3.small"
rds_allocated_storage = 50
rds_engine_version    = "15.4"

elasticache_node_type       = "cache.t3.small"
elasticache_num_cache_nodes = 2

db_name     = "portfolio_staging"
db_username = "admin"

tags = {
  CostCenter = "staging"
  Owner      = "devops-team"
}
