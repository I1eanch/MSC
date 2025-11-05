# AWS Infrastructure with Terraform

This repository contains Terraform configurations for provisioning a comprehensive AWS infrastructure with environment separation (dev, staging, prod).

## Architecture Overview

The infrastructure includes:

- **Network Layer**: VPC with public/private subnets across multiple AZs, NAT Gateways, Internet Gateway
- **Compute**: 
  - ECS Fargate cluster for containerized applications
  - Lambda functions for serverless workloads
- **API Layer**: API Gateway for HTTP APIs
- **Database**: RDS PostgreSQL with automated backups
- **Cache**: ElastiCache Redis for session storage
- **Storage**: S3 buckets for media, static content, and logs
- **CDN**: CloudFront distribution for content delivery
- **Messaging**: SNS topics and SQS queues for asynchronous processing
- **Security**: AWS Secrets Manager for sensitive data

## Directory Structure

```
terraform/
├── main.tf                 # Main infrastructure orchestration
├── variables.tf            # Global variables
├── outputs.tf              # Infrastructure outputs
├── backend.tf              # Remote state configuration
├── versions.tf             # Terraform and provider versions
├── environments/           # Environment-specific configurations
│   ├── dev.tfvars
│   ├── staging.tfvars
│   └── prod.tfvars
├── modules/                # Reusable Terraform modules
│   ├── vpc/               # VPC and networking
│   ├── ecs/               # ECS cluster and services
│   ├── lambda/            # Lambda functions
│   ├── api-gateway/       # API Gateway
│   ├── rds/               # PostgreSQL database
│   ├── elasticache/       # Redis cache
│   ├── s3/                # S3 buckets
│   ├── cloudfront/        # CloudFront CDN
│   ├── messaging/         # SNS/SQS
│   └── secrets/           # Secrets Manager
└── scripts/               # Utility scripts
    ├── bootstrap.sh       # Bootstrap AWS backend
    └── validate.sh        # Validate Terraform config
```

## Prerequisites

1. **Terraform**: Install Terraform >= 1.5.0
   ```bash
   # macOS
   brew install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
   unzip terraform_1.5.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **AWS CLI**: Install and configure AWS CLI
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Configure credentials
   aws configure
   ```

3. **Required AWS Permissions**: Ensure your AWS credentials have permissions to create:
   - VPC, Subnets, Route Tables, NAT Gateways
   - EC2 Security Groups
   - ECS Clusters, Task Definitions
   - Lambda Functions
   - API Gateway
   - RDS Instances
   - ElastiCache Clusters
   - S3 Buckets
   - CloudFront Distributions
   - SNS Topics, SQS Queues
   - Secrets Manager Secrets
   - IAM Roles and Policies
   - CloudWatch Log Groups

## Quick Start

### 1. Bootstrap Infrastructure

Run the bootstrap script to create S3 bucket for Terraform state and DynamoDB table for state locking:

```bash
cd terraform
./scripts/bootstrap.sh
```

This will:
- Create an S3 bucket for Terraform state storage
- Enable versioning and encryption on the bucket
- Create a DynamoDB table for state locking
- Generate a `backend-config.hcl` file

### 2. Initialize Terraform

```bash
# Initialize with backend configuration
terraform init -backend-config=backend-config.hcl

# Or initialize without backend (for testing)
terraform init -backend=false
```

### 3. Validate Configuration

```bash
# Run validation script
./scripts/validate.sh

# Or manually validate
terraform fmt -recursive
terraform validate
```

### 4. Deploy an Environment

#### Development Environment

```bash
# Create workspace
terraform workspace new dev

# Plan deployment
terraform plan -var-file=environments/dev.tfvars -out=dev.tfplan

# Apply changes
terraform apply dev.tfplan
```

#### Staging Environment

```bash
# Create workspace
terraform workspace new staging

# Plan deployment
terraform plan -var-file=environments/staging.tfvars -out=staging.tfplan

# Apply changes
terraform apply staging.tfplan
```

#### Production Environment

```bash
# Create workspace
terraform workspace new prod

# Plan deployment
terraform plan -var-file=environments/prod.tfvars -out=prod.tfplan

# Review carefully before applying!
terraform apply prod.tfplan
```

## Environment Configuration

### Development (dev)
- Single NAT Gateway (cost optimization)
- Smaller instance sizes (db.t3.micro, cache.t3.micro)
- No CloudFront distribution
- Minimal redundancy

### Staging (staging)
- Multi-AZ NAT Gateways
- Medium instance sizes (db.t3.small, cache.t3.small)
- CloudFront enabled
- Moderate redundancy

### Production (prod)
- Multi-AZ NAT Gateways
- Larger instance sizes (db.t3.medium, cache.t3.medium)
- CloudFront enabled
- Full redundancy
- Enhanced monitoring

## Accessing Infrastructure

After deployment, retrieve infrastructure details:

```bash
# View all outputs
terraform output

# View specific output
terraform output vpc_id
terraform output rds_endpoint

# View sensitive outputs
terraform output -json | jq .
```

## Deploying Applications

### ECS Deployment

1. Build and push Docker image to ECR:
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name rayman-portfolio-api
   
   # Authenticate Docker to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and push
   docker build -t rayman-portfolio-api .
   docker tag rayman-portfolio-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/rayman-portfolio-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/rayman-portfolio-api:latest
   ```

2. Create ECS Task Definition and Service (example):
   ```bash
   # This would typically be done through additional Terraform or AWS CLI
   aws ecs create-service --cluster <cluster-name> --service-name api --task-definition api:1 --desired-count 2
   ```

### Lambda Deployment

1. Package your Lambda code:
   ```bash
   cd lambda-functions/api
   zip -r function.zip .
   ```

2. Update Lambda function:
   ```bash
   aws lambda update-function-code \
     --function-name <lambda-function-name> \
     --zip-file fileb://function.zip
   ```

## Secrets Management

Secrets are stored in AWS Secrets Manager. To retrieve secrets:

```bash
# Get database credentials
aws secretsmanager get-secret-value \
  --secret-id <environment>-db-password \
  --query SecretString \
  --output text | jq .

# Update secrets
aws secretsmanager update-secret \
  --secret-id <environment>-api-keys \
  --secret-string '{"api_key":"new-value"}'
```

## Monitoring and Logging

### CloudWatch Logs

Logs are available in CloudWatch Log Groups:
- `/ecs/<environment>` - ECS container logs
- `/aws/lambda/<environment>-api` - Lambda API logs
- `/aws/lambda/<environment>-worker` - Lambda worker logs
- `/aws/apigateway/<environment>` - API Gateway logs

### Metrics

- ECS cluster metrics in CloudWatch Container Insights
- Lambda metrics (invocations, errors, duration)
- RDS Performance Insights
- ElastiCache metrics

## Maintenance

### Updating Infrastructure

1. Update the relevant `.tf` files or environment variables
2. Run `terraform plan` to review changes
3. Apply changes with `terraform apply`

### Database Backups

RDS automated backups are configured:
- Backup retention: 7 days (configurable)
- Backup window: 03:00-04:00 UTC
- Maintenance window: Sunday 04:00-05:00 UTC

### Disaster Recovery

1. **State Recovery**: Terraform state is versioned in S3
2. **Database Recovery**: Restore from RDS automated backups or snapshots
3. **Infrastructure Recreation**: Re-run `terraform apply` with the same configuration

## Cost Optimization

### Development Environment
- Use spot instances for non-critical workloads
- Single NAT Gateway
- Smaller instance sizes
- Shorter log retention

### Auto-Scaling
Configure ECS services and Lambda concurrency based on actual usage.

### Reserved Instances
For production, consider Reserved Instances or Savings Plans for RDS and ElastiCache.

## Security Best Practices

1. **Network Security**
   - Resources in private subnets
   - Security groups with minimal required access
   - VPC endpoints for AWS services

2. **Data Encryption**
   - RDS encryption at rest
   - S3 encryption enabled
   - Secrets Manager for sensitive data

3. **Access Control**
   - IAM roles with least privilege
   - No hard-coded credentials
   - Use AWS Secrets Manager

4. **Monitoring**
   - CloudWatch alarms for critical metrics
   - CloudTrail for audit logging
   - VPC Flow Logs for network analysis

## Troubleshooting

### Common Issues

1. **Terraform Init Fails**
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify S3 bucket and DynamoDB table exist
   - Check backend configuration

2. **Plan/Apply Fails**
   - Review error message
   - Check AWS service quotas
   - Verify IAM permissions
   - Check for resource naming conflicts

3. **State Lock Issues**
   ```bash
   # Force unlock (use with caution!)
   terraform force-unlock <lock-id>
   ```

4. **Resource Already Exists**
   - Import existing resource: `terraform import <resource> <id>`
   - Or rename in Terraform

### Getting Help

1. Check Terraform documentation: https://www.terraform.io/docs
2. AWS provider documentation: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
3. Review CloudWatch logs for application issues

## Cleanup

To destroy infrastructure:

```bash
# Switch to correct workspace
terraform workspace select dev

# Plan destroy
terraform plan -destroy -var-file=environments/dev.tfvars

# Destroy (WARNING: This will delete all resources!)
terraform destroy -var-file=environments/dev.tfvars
```

**Note**: Some resources may need manual deletion:
- S3 buckets with objects
- RDS snapshots
- CloudWatch log groups

## Contributing

When making infrastructure changes:
1. Create a feature branch
2. Make changes to Terraform files
3. Run `terraform fmt` and `terraform validate`
4. Test in dev environment first
5. Create pull request with plan output

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
