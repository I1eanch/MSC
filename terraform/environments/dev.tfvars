environment = "dev"
aws_region  = "us-east-1"

vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

enable_nat_gateway = true
single_nat_gateway = true

enable_ecs         = true
enable_lambda      = true
enable_cloudfront  = false
enable_api_gateway = true

rds_instance_class    = "db.t3.micro"
rds_allocated_storage = 20
rds_engine_version    = "15.4"

elasticache_node_type       = "cache.t3.micro"
elasticache_num_cache_nodes = 1

db_name     = "portfolio_dev"
db_username = "admin"

tags = {
  CostCenter = "development"
  Owner      = "devops-team"
}
