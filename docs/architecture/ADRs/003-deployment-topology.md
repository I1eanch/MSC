# ADR 003: Deployment Topology & Infrastructure

**Status**: Accepted

**Date**: 2024

**Context**

The platform requires a scalable, highly available infrastructure supporting millions of concurrent users, global distribution, complex data processing, and integration with multiple third-party services. The infrastructure must support rapid deployment, easy rollback, and comprehensive monitoring.

**Decision**

We adopt an AWS-based microservices deployment architecture with the following topology:

## High-Level Architecture

```
Global Users
    ↓
CloudFront CDN (geo-distributed)
    ↓
AWS Route 53 (DNS, health checks)
    ↓
Application Load Balancer
    ↓
ECS Fargate Clusters (multiple AZs)
    ↓
RDS PostgreSQL (Multi-AZ)
    ↓
Supporting Services (Redis, SQS, Lambda, S3)
```

## Core Infrastructure Components

### 1. Content Delivery & Edge Computing

**CloudFront**:
- Global CDN for static assets, API responses
- 200+ edge locations worldwide
- SSL/TLS termination
- DDoS protection (AWS Shield)
- Caching strategies by content type

**S3 Origin**:
- Static assets (HTML, CSS, JS, images)
- Video assets (HLS/DASH streaming)
- Backup and archival storage
- Lifecycle policies for cost optimization

**Regional CDN** (Specialized):
- Dedicated video CDN for high-bandwidth streaming
- Primary: Cloudflare Stream or Bunny CDN
- Fallback: CloudFront with custom origin

### 2. Compute Layer

**AWS ECS Fargate**:
- Containerized microservices (no server management)
- Multi-AZ deployment for high availability
- Auto-scaling groups based on CPU/memory/custom metrics
- Service discovery via AWS Cloud Map

**Cluster Architecture**:
```
Availability Zone 1:
  - API Gateway Service (2+ instances)
  - Auth Service (2+ instances)
  - Training Service (2+ instances)
  - Content Service (2+ instances)
  - Payment Service (2+ instances)
  - AI Service (2+ instances)

Availability Zone 2:
  - [Same services for redundancy]

Availability Zone 3:
  - [Same services for resilience]
```

**Task Definition Specifications**:
- CPU: 256-1024 vCPU per task (variable by service)
- Memory: 512-2048 MB per task (variable by service)
- Container health checks every 30 seconds
- Graceful shutdown timeout: 30 seconds

### 3. Database Layer

**Amazon RDS PostgreSQL Multi-AZ**:
- Primary in availability zone A
- Synchronous standby in availability zone B
- Read replicas in availability zones C (and cross-region)
- Automated failover < 2 minutes
- Daily automated backups (35-day retention)
- Manual snapshots for migration/disaster recovery

**Database Configuration**:
- Instance class: db.r6i.2xlarge or equivalent
- Storage: General Purpose (gp3) SSD
- Max allocated storage: 5TB (auto-scaling)
- Backup window: 00:00 UTC (configurable per region)
- Maintenance window: Sunday 02:00 UTC

**Read Replicas**:
- Asynchronous replicas for analytics workloads
- Regional replicas for disaster recovery
- Cross-region read replica for global redundancy

**Connection Management**:
- Connection pooling: pgBouncer (300 connections max)
- RDS Proxy for Fargate tasks
- Statement timeout: 5 minutes

### 4. Cache Layer

**Amazon ElastiCache Redis**:
- Multi-AZ deployment with automatic failover
- Instance type: cache.r6g.xlarge or equivalent
- 64GB+ memory for session/cache hotspot

**Usage Patterns**:
- Session storage (TTL: 24 hours)
- Real-time leaderboards
- Rate limiting buckets
- Frequently accessed data (LRU eviction)

**Backup Strategy**:
- Automatic daily snapshots
- 35-day retention
- Cross-AZ snapshots

### 5. Asynchronous Processing

**AWS SQS**:
- Standard queues for at-least-once delivery
- FIFO queues for ordering guarantees (if required)
- Message retention: 14 days
- Visibility timeout: 5 minutes
- Dead-letter queues for failed messages

**Queue Types**:
- Email notifications
- Payment webhooks
- Analytics events
- Health metric aggregation
- AI recommendation generation

**AWS Lambda**:
- Processors for SQS messages (Python 3.11+)
- Concurrent execution limit: 1000 (scalable)
- Timeout: 15 minutes max
- Memory: 128-10240 MB (provisioned concurrency for critical functions)

**Fallback: RabbitMQ**:
- Self-hosted on EC2 or managed service
- For complex routing scenarios
- Cluster mode with 3+ nodes

### 6. Media Storage & Processing

**AWS S3 Buckets**:
```
- fitness-platform-videos/          (video content, Glacier after 90 days)
- fitness-platform-images/          (user/trainer images, Intelligent-Tiering)
- fitness-platform-documents/       (PDFs, certificates)
- fitness-platform-backups/         (database/config backups)
- fitness-platform-analytics/       (export files, logs)
```

**Bucket Policies**:
- Versioning: Enabled for critical buckets
- Encryption: AES-256 (server-side)
- Public access: Blocked
- Lifecycle policies: Archive to Glacier/Deep Archive

**Video Processing**:
- AWS Elemental MediaConvert for encoding
- Transcoding workflow: MP4 → HLS/DASH
- Multiple bitrates: 480p, 720p, 1080p, 4K

### 7. Monitoring & Logging

**CloudWatch**:
- Centralized logging (all services → CloudWatch Logs)
- Log retention: 90 days (configurable)
- Log groups: `/aws/ecs/service-name`
- Custom metrics for business KPIs

**Log Retention**:
```
- Application logs: 90 days
- API access logs: 30 days
- Audit logs: 2 years
- Error logs: 180 days
```

**X-Ray Tracing**:
- Distributed tracing for requests
- Service map visualization
- Performance profiling

**Dashboards**:
- Real-time service health
- Error rates and latency
- Database performance
- Business metrics (signups, payments, usage)

### 8. Load Balancing & API Gateway

**Application Load Balancer**:
- Listens on ports 80 (HTTP) and 443 (HTTPS)
- SSL/TLS certificates from ACM
- Target groups per service
- Health check interval: 30 seconds
- Stickiness: Enabled for stateful services (30 minutes)

**AWS API Gateway**:
- REST API or HTTP API
- Request validation
- Rate limiting: 10,000 RPS default
- Throttling: 5,000 concurrent executions
- WAF integration for DDoS protection

**Rate Limiting**:
- Per-user: 1000 requests/hour (configurable)
- Per-IP: 10,000 requests/hour
- Burst capacity: 2x limit for 1 minute

### 9. Search & Analytics

**AWS OpenSearch**:
- Centralized search for content (videos, courses, articles)
- 3-node cluster (multi-AZ)
- Index replicas: 1 (for redundancy)
- Shard count: 5 per index

**Kibana Dashboards**:
- Content search analytics
- User behavior patterns
- System performance metrics

**AWS Kinesis Data Streams**:
- Real-time event streaming
- Sharding based on event volume
- Event retention: 24 hours
- Consumers: Analytics, AI, Dashboards

## Disaster Recovery & High Availability

### Backup Strategy

**Database**:
- Automated daily snapshots (RDS)
- 35-day retention
- Cross-region backup copies
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 2 hours

**Application**:
- Immutable container images in ECR
- Infrastructure as Code (Terraform) in Git
- Configuration in AWS Secrets Manager
- RTO: 15 minutes (blue-green deployment)

**Data**:
- S3 versioning and MFA delete
- S3 replication to secondary region
- Glacier archive for compliance

### Failover Procedures

**Database Failover**:
- Automatic RDS multi-AZ failover < 2 minutes
- Manual failover to read replica (< 5 minutes)
- Cross-region failover (manual, 5-30 minutes)

**Application Failover**:
- ALB automatically routes around unhealthy instances
- ECS tasks automatically restarted
- Blue-green deployments for zero-downtime updates

**Regional Failover**:
- Route 53 health checks detect region failure
- DNS redirect to secondary region (TTL: 60 seconds)
- Warm standby environment in secondary region

## Security Considerations

### Network Isolation

**VPC Configuration**:
- Private subnets for ECS, RDS, ElastiCache
- Public subnets for NAT Gateways, ALB
- VPC Endpoints for AWS services (no internet exposure)
- NACLs and Security Groups for fine-grained access

**Security Groups**:
```
ALB: Inbound 80 (HTTP), 443 (HTTPS) from 0.0.0.0
ECS: Inbound from ALB security group
RDS: Inbound from ECS security group only
Redis: Inbound from ECS security group only
```

### Encryption

- **Transit**: TLS 1.2+ for all communications
- **Rest**: AES-256 for RDS, S3, ElastiCache
- **Key Management**: AWS KMS for key encryption

## Compliance & Audit

**Audit Logging**:
- CloudTrail for AWS API calls (2-year retention)
- VPC Flow Logs for network traffic
- RDS audit plugin for database queries (high-sensitivity operations)
- Application logs with request/response (PII redacted)

## Cost Optimization

**Reserved Instances**: 
- Commit to 1-year terms for 30-40% savings
- Mix on-demand and reserved across services

**Spot Instances** (optional):
- Non-critical background workers
- 70-90% cost savings
- 2-minute interruption notice

**Auto-Scaling**:
- Target tracking policies (CPU 70%, Memory 80%)
- Scheduled scaling for predictable loads
- Step scaling for rapid changes

## Rationale

1. **AWS Ecosystem**: Seamless integration, managed services reduce operational burden
2. **Fargate**: Container abstraction without infrastructure management
3. **Multi-AZ**: Automatic failover, disaster recovery, compliance
4. **CloudFront**: Global distribution, DDoS protection, cost-effective caching
5. **RDS Proxy**: Connection pooling without application changes
6. **Infrastructure as Code**: Repeatable, version-controlled deployments

## Consequences

**Positive**:
- Automatic scaling based on demand
- High availability (99.99% uptime achievable)
- Global content delivery
- Minimal infrastructure management
- Comprehensive AWS monitoring tools

**Negative**:
- AWS vendor lock-in (mitigated by containerization, IaC)
- Data transfer costs between regions
- Complexity of distributed systems
- Requires AWS operational expertise

## Related ADRs

- [ADR 001: Technology Stack](./001-technology-stack.md)
- [ADR 006: Security & Compliance](./006-security-compliance.md)
