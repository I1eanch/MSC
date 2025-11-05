# Infrastructure Documentation

## Overview

This document describes the AWS infrastructure provisioned via Terraform for the Rayman Portfolio application.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CloudFront CDN                          │
│                      (Content Delivery)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (HTTP API)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴──────────────┐
                ▼                           ▼
     ┌──────────────────┐        ┌──────────────────┐
     │  Lambda (API)    │        │  ECS Cluster     │
     │  - API handlers  │        │  - Fargate       │
     │  - Serverless    │        │  - Containers    │
     └────────┬─────────┘        └────────┬─────────┘
              │                           │
              └───────────┬───────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ RDS Postgres │  │ ElastiCache  │  │   S3 Media   │
│  - Database  │  │  - Redis     │  │   - Uploads  │
│  - Multi-AZ  │  │  - Sessions  │  │   - Static   │
└──────────────┘  └──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SNS Topics & SQS Queues                       │
│                   (Async Processing & Alerts)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Secrets Manager                           │
│                  (Database & API Credentials)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Infrastructure Components

### Network Layer
- **VPC**: Isolated network environment with custom CIDR block
- **Subnets**: 
  - Public subnets across multiple AZs (for ALB, NAT Gateway)
  - Private subnets across multiple AZs (for application resources)
- **Internet Gateway**: Public internet access for public subnets
- **NAT Gateway**: Outbound internet access for private subnets
- **VPC Endpoints**: Direct access to S3 without internet gateway

### Compute Layer

#### ECS (Elastic Container Service)
- Fargate launch type (serverless containers)
- Application Load Balancer for traffic distribution
- Auto-scaling based on CPU/memory utilization
- CloudWatch Container Insights enabled
- Integration with Secrets Manager for credentials

#### Lambda Functions
- **API Function**: Handles HTTP API requests
- **Worker Function**: Background processing tasks
- VPC-enabled for database access
- Environment variables for configuration
- Integration with API Gateway

### API Layer
- **API Gateway**: HTTP API (v2) for RESTful endpoints
- CORS configuration for web clients
- CloudWatch logging enabled
- Integration with Lambda functions
- Custom domain support (configurable)

### Database Layer

#### RDS PostgreSQL
- PostgreSQL engine version 15.4
- Automated backups (7-day retention)
- Multi-AZ deployment (staging/prod)
- Encrypted at rest
- Private subnet placement
- Security group restrictions
- Performance Insights enabled

#### ElastiCache Redis
- Redis 7.0 engine
- In-memory session storage
- Cache for frequently accessed data
- Private subnet placement
- Automatic failover (multi-node)
- Encryption in transit

### Storage Layer

#### S3 Buckets
1. **Media Bucket**
   - User-uploaded content
   - Versioning enabled
   - Lifecycle policies (transition to IA/Glacier)
   - Server-side encryption

2. **Static Content Bucket**
   - Static assets (CSS, JS, images)
   - CloudFront origin
   - Versioning enabled

3. **Logs Bucket**
   - Application and access logs
   - 30-day retention policy
   - Encrypted at rest

### CDN Layer
- **CloudFront Distribution**: 
  - Global content delivery
  - HTTPS only
  - Origin Access Identity for S3
  - Compression enabled
  - Cache behaviors optimized

### Messaging Layer

#### SNS Topics
- **Notifications**: User notifications, events
- **Alerts**: System monitoring alerts

#### SQS Queues
- **Processing Queue**: Background job processing
- **Email Queue**: Email notification queue
- **Dead Letter Queues**: Failed message handling
- Long polling enabled
- Message retention: 4 days

### Security Layer

#### Secrets Manager
- **Database Credentials**: Master password, connection strings
- **API Keys**: Third-party API keys, JWT secrets
- Automatic rotation support (configurable)
- Encrypted at rest

#### IAM Roles & Policies
- ECS Task Execution Role
- ECS Task Role
- Lambda Execution Role
- Least privilege principle applied

#### Security Groups
- Database SG: PostgreSQL (5432) from app layer only
- Cache SG: Redis (6379) from app layer only
- ECS Tasks SG: HTTP from ALB only
- Lambda SG: Outbound to database and cache
- ALB SG: HTTP/HTTPS from internet

### Monitoring & Logging

#### CloudWatch Log Groups
- `/ecs/<environment>`: ECS container logs
- `/aws/lambda/<environment>-api`: Lambda API logs
- `/aws/lambda/<environment>-worker`: Lambda worker logs
- `/aws/apigateway/<environment>`: API Gateway logs
- 30-day retention

#### CloudWatch Metrics
- ECS Container Insights
- Lambda metrics (invocations, errors, duration)
- RDS Performance Insights
- ElastiCache metrics
- Custom application metrics

## Environment Configurations

### Development (dev)
```
Environment:         dev
AWS Region:          us-east-1
VPC CIDR:           10.0.0.0/16
Availability Zones:  2 (us-east-1a, us-east-1b)
NAT Gateways:        1 (shared)
RDS Instance:        db.t3.micro
RDS Storage:         20 GB
ElastiCache Node:    cache.t3.micro
ElastiCache Nodes:   1
CloudFront:          Disabled
```

**Purpose**: Development and testing
**Cost**: ~$50-100/month

### Staging (staging)
```
Environment:         staging
AWS Region:          us-east-1
VPC CIDR:           10.1.0.0/16
Availability Zones:  3 (us-east-1a, us-east-1b, us-east-1c)
NAT Gateways:        3 (one per AZ)
RDS Instance:        db.t3.small
RDS Storage:         50 GB
ElastiCache Node:    cache.t3.small
ElastiCache Nodes:   2
CloudFront:          Enabled
```

**Purpose**: Pre-production testing and QA
**Cost**: ~$200-300/month

### Production (prod)
```
Environment:         prod
AWS Region:          us-east-1
VPC CIDR:           10.2.0.0/16
Availability Zones:  3 (us-east-1a, us-east-1b, us-east-1c)
NAT Gateways:        3 (one per AZ)
RDS Instance:        db.t3.medium
RDS Storage:         100 GB
RDS Multi-AZ:        Enabled
ElastiCache Node:    cache.t3.medium
ElastiCache Nodes:   3
CloudFront:          Enabled
```

**Purpose**: Production workloads
**Cost**: ~$400-600/month

## Deployment Process

### Initial Setup (One-time)

1. **Bootstrap Backend**
   ```bash
   cd terraform
   ./scripts/bootstrap.sh
   ```
   This creates S3 bucket and DynamoDB table for state management.

2. **Initialize Terraform**
   ```bash
   terraform init -backend-config=backend-config.hcl
   ```

### Environment Deployment

1. **Select/Create Workspace**
   ```bash
   terraform workspace new staging  # or select existing
   ```

2. **Plan Infrastructure**
   ```bash
   terraform plan -var-file=environments/staging.tfvars -out=staging.tfplan
   ```

3. **Review and Apply**
   ```bash
   terraform apply staging.tfplan
   ```

4. **Verify Deployment**
   ```bash
   terraform output
   ```

## Infrastructure Updates

### Making Changes

1. Update Terraform configuration files
2. Run `terraform plan` to preview changes
3. Review the plan carefully
4. Apply changes with `terraform apply`

### Rolling Back

1. Revert code changes
2. Run `terraform plan` to verify
3. Apply the reverted configuration

### Emergency Rollback

```bash
# Restore previous state
terraform state pull > backup.tfstate
terraform state push <previous-backup.tfstate>
```

## Disaster Recovery

### State Recovery
- Terraform state is stored in S3 with versioning
- Can restore previous state versions from S3
- DynamoDB prevents concurrent modifications

### Database Recovery
- Automated backups (7-day retention)
- Manual snapshots before major changes
- Point-in-time recovery available
- Cross-region snapshot copy (for prod)

### Infrastructure Recreation
- All infrastructure is code-defined
- Can recreate from scratch with `terraform apply`
- Secrets need to be manually configured after recreation

## Security Considerations

### Network Security
- All application resources in private subnets
- Security groups follow least privilege
- Network ACLs for additional protection
- VPC Flow Logs enabled (optional)

### Data Security
- Encryption at rest (RDS, S3, ElastiCache)
- Encryption in transit (TLS/SSL)
- Secrets stored in AWS Secrets Manager
- No hard-coded credentials

### Access Control
- IAM roles with minimal permissions
- MFA required for production access
- CloudTrail logging all API calls
- Regular security audits

### Compliance
- GDPR considerations (data location, encryption)
- SOC 2 controls (logging, access control)
- Regular vulnerability scanning

## Cost Management

### Cost Breakdown (Estimated Monthly)

**Development:**
- EC2 (NAT Gateway): $32
- RDS db.t3.micro: $15
- ElastiCache t3.micro: $12
- Data transfer: $10
- Other services: $10
- **Total: ~$80/month**

**Staging:**
- EC2 (NAT Gateway x3): $96
- RDS db.t3.small: $30
- ElastiCache t3.small x2: $48
- CloudFront: $20
- Data transfer: $30
- Other services: $30
- **Total: ~$250/month**

**Production:**
- EC2 (NAT Gateway x3): $96
- RDS db.t3.medium (Multi-AZ): $120
- ElastiCache t3.medium x3: $180
- CloudFront: $50
- Data transfer: $100
- Other services: $50
- **Total: ~$600/month**

### Cost Optimization

1. **Use Reserved Instances** for predictable workloads
2. **Enable auto-scaling** to match demand
3. **Use S3 lifecycle policies** to reduce storage costs
4. **Monitor and right-size** instances based on usage
5. **Delete unused resources** (snapshots, old AMIs)
6. **Use Spot Instances** for non-critical workloads

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Application Health**
   - API response times
   - Error rates
   - Request counts

2. **Database Performance**
   - CPU utilization
   - Connection count
   - Query performance

3. **Cache Hit Rate**
   - Redis hit/miss ratio
   - Memory usage

4. **Infrastructure**
   - ECS task status
   - Lambda errors and throttles
   - NAT Gateway bandwidth

### Recommended Alarms

- Database CPU > 80%
- API Gateway 5xx errors > 10/min
- Lambda concurrent executions near limit
- RDS storage < 10% free
- Cache evictions increasing

## Troubleshooting Guide

### Common Issues

1. **Database Connection Failures**
   - Check security group rules
   - Verify subnet routing
   - Check secret rotation
   - Validate credentials in Secrets Manager

2. **High Latency**
   - Check CloudFront cache hit rate
   - Review database query performance
   - Verify Redis cache effectiveness
   - Check NAT Gateway bandwidth

3. **Lambda Timeouts**
   - Increase function timeout
   - Optimize cold start time
   - Check VPC configuration
   - Review database connection pooling

4. **ECS Task Failures**
   - Check CloudWatch logs
   - Verify task definition
   - Check resource limits
   - Validate environment variables

## Maintenance Schedule

### Daily
- Review CloudWatch dashboards
- Check application logs for errors
- Monitor cost and usage

### Weekly
- Review security group rules
- Check for AWS service updates
- Analyze CloudWatch metrics trends

### Monthly
- Review and update IAM policies
- Check for unused resources
- Update Terraform modules
- Review backup retention policies

### Quarterly
- Security audit
- Cost optimization review
- Disaster recovery testing
- Infrastructure capacity planning

## Support & Contact

For infrastructure issues:
1. Check CloudWatch logs and metrics
2. Review this documentation
3. Consult AWS documentation
4. Contact DevOps team

## Additional Resources

- [Terraform Configuration](./terraform/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Best Practices](https://aws.amazon.com/architecture/best-practices/)
