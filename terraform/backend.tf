# Backend configuration for Terraform state
# Uncomment and configure after creating the S3 bucket and DynamoDB table
# Run scripts/bootstrap.sh first to set up the backend infrastructure

# terraform {
#   backend "s3" {
#     bucket         = "rayman-portfolio-terraform-state"
#     key            = "terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "rayman-portfolio-terraform-locks"
#   }
# }
