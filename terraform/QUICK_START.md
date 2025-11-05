# Quick Start Guide

## Prerequisites

1. Install Terraform (>= 1.5.0)
2. Configure AWS credentials
3. Ensure you have the necessary AWS permissions

## Initial Setup (One-time)

### 1. Bootstrap Backend Infrastructure

```bash
cd terraform
./scripts/bootstrap.sh
```

This creates:
- S3 bucket for Terraform state
- DynamoDB table for state locking
- Backend configuration file

### 2. Initialize Terraform

```bash
terraform init -backend-config=backend-config.hcl
```

## Deploy Staging Environment

### 1. Create Workspace

```bash
terraform workspace new staging
```

### 2. Review Configuration

```bash
# Review the staging variables
cat environments/staging.tfvars

# Run plan to see what will be created
terraform plan -var-file=environments/staging.tfvars
```

### 3. Deploy Infrastructure

```bash
# Save the plan
terraform plan -var-file=environments/staging.tfvars -out=staging.tfplan

# Review the plan output carefully

# Apply the plan
terraform apply staging.tfplan
```

### 4. Verify Deployment

```bash
# View all outputs
terraform output

# View specific outputs
terraform output vpc_id
terraform output api_gateway_endpoint
terraform output cloudfront_domain_name
```

## Deploy Other Environments

### Development

```bash
terraform workspace new dev
terraform plan -var-file=environments/dev.tfvars -out=dev.tfplan
terraform apply dev.tfplan
```

### Production

```bash
terraform workspace new prod
terraform plan -var-file=environments/prod.tfvars -out=prod.tfplan

# IMPORTANT: Review plan very carefully for production!
terraform apply prod.tfplan
```

## Accessing Resources

### Database Connection

```bash
# Get database endpoint
DB_ENDPOINT=$(terraform output -raw rds_endpoint)

# Get database credentials from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id rayman-portfolio-staging-db-password \
  --query SecretString \
  --output text | jq .

# Connect to database
psql -h $DB_ENDPOINT -U admin -d portfolio_staging
```

### Redis Connection

```bash
# Get Redis endpoint
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

# Test connection
redis-cli -h $REDIS_ENDPOINT ping
```

### API Gateway

```bash
# Get API endpoint
API_URL=$(terraform output -raw api_gateway_endpoint)

# Test API
curl $API_URL/staging
```

### S3 Buckets

```bash
# List buckets
terraform output media_bucket_name
terraform output static_bucket_name

# Upload file to media bucket
aws s3 cp file.jpg s3://$(terraform output -raw media_bucket_name)/
```

### CloudFront CDN

```bash
# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)

# Access via CloudFront
curl https://$CLOUDFRONT_DOMAIN/path/to/file.jpg
```

## Common Tasks

### Update Infrastructure

```bash
# 1. Make changes to .tf files or .tfvars files

# 2. Plan changes
terraform plan -var-file=environments/staging.tfvars

# 3. Apply changes
terraform apply -var-file=environments/staging.tfvars
```

### Deploy Application to ECS

```bash
# 1. Get ECS cluster name
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)

# 2. Build and push Docker image
docker build -t myapp .
docker tag myapp:latest <ecr-url>/myapp:latest
docker push <ecr-url>/myapp:latest

# 3. Update ECS service (create task definition first)
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service myapp \
  --force-new-deployment
```

### Deploy Lambda Function

```bash
# 1. Get Lambda function names
terraform output lambda_function_names

# 2. Package code
cd lambda-code
zip -r function.zip .

# 3. Update function
aws lambda update-function-code \
  --function-name rayman-portfolio-staging-api \
  --zip-file fileb://function.zip
```

### View Logs

```bash
# ECS logs
aws logs tail /ecs/rayman-portfolio-staging --follow

# Lambda API logs
aws logs tail /aws/lambda/rayman-portfolio-staging-api --follow

# Lambda Worker logs
aws logs tail /aws/lambda/rayman-portfolio-staging-worker --follow

# API Gateway logs
aws logs tail /aws/apigateway/rayman-portfolio-staging --follow
```

### Switch Between Environments

```bash
# List workspaces
terraform workspace list

# Switch to different workspace
terraform workspace select prod

# Now all commands use prod configuration
terraform plan -var-file=environments/prod.tfvars
```

## Troubleshooting

### State Lock Issues

```bash
# If state is locked and you're sure no other operation is running
terraform force-unlock <lock-id>
```

### Refresh State

```bash
# Refresh state to match actual infrastructure
terraform refresh -var-file=environments/staging.tfvars
```

### Import Existing Resources

```bash
# If you have existing resources to import
terraform import module.vpc.aws_vpc.main vpc-xxxxx
```

### Validate Configuration

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Or use the validation script
./scripts/validate.sh
```

## Destroy Infrastructure

⚠️ **WARNING**: This will destroy all resources!

```bash
# Switch to correct workspace
terraform workspace select staging

# Plan destroy
terraform plan -destroy -var-file=environments/staging.tfvars

# Destroy infrastructure
terraform destroy -var-file=environments/staging.tfvars
```

**Note**: Some resources may need manual cleanup:
- S3 buckets with objects
- RDS snapshots
- CloudWatch log groups (optional)

## Next Steps

1. ✅ Deploy staging environment
2. Configure DNS/custom domain (if needed)
3. Set up CI/CD pipeline
4. Deploy application code
5. Configure monitoring alerts
6. Set up automated backups
7. Document runbooks
8. Plan production deployment

## Support

- Check [README.md](./README.md) for detailed documentation
- Review [INFRASTRUCTURE.md](../INFRASTRUCTURE.md) for architecture details
- Consult AWS documentation for service-specific issues
