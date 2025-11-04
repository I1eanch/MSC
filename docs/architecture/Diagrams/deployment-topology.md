# Deployment Topology Diagram

## AWS Regional Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET (Users)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  AWS Route 53      │
                    │  (DNS + Failover)  │
                    │                    │
                    │ Geolocation Route: │
                    │ • US/Americas →    │
                    │   us-east-1        │
                    │ • Europe → eu-w1   │
                    │ • Asia → ap-se1    │
                    │ • Health check: 30s│
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────────┐        ┌────────────┐      ┌────────────┐
    │us-east-1  │        │eu-west-1  │      │ap-se1-1   │
    │(Primary)  │        │(Secondary)│      │(Standby)   │
    └────┬───────┘        └────┬──────┘      └────┬───────┘
         │                     │                   │
         ▼                     ▼                   ▼
    ┌──────────────────────────────┐
    │   AWS CLOUDFRONT             │
    │   Global CDN                 │
    ├──────────────────────────────┤
    │ • Static assets              │
    │ • Video streaming (origin)   │
    │ • API response caching       │
    │ • 200+ edge locations        │
    │ • DDoS protection (Shield)   │
    │ • WAF integration            │
    └───────────┬──────────────────┘
                │
        ┌───────▼───────┐
        │  Application  │
        │  Load Balancer│
        │  (ALB)        │
        │               │
        │ • SSL/TLS     │
        │ • Path routing│
        │ • Health check│
        │ • Stickiness │
        └───────┬───────┘
                │
    ┌───────────┼───────────┬──────────────┐
    │           │           │              │
    ▼           ▼           ▼              ▼
┌──────────────────────────────────────────────────────────┐
│   ECS FARGATE CLUSTER (us-east-1)                       │
│                                                          │
│   Multi-AZ Deployment (3 Availability Zones)            │
│                                                          │
│   ┌────────────────┬────────────────┬────────────────┐ │
│   │  AZ: us-e1a   │  AZ: us-e1b    │  AZ: us-e1c   │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │API Svc   │ │ │API Svc   │  │ │API Svc   │  │ │
│   │  │Container1│ │ │Container2 │  │ │Container3 │  │ │
│   │  │          │ │ │          │  │ │          │  │ │
│   │  │CPU: 512  │ │ │CPU: 512  │  │ │CPU: 512  │  │ │
│   │  │RAM: 1GB  │ │ │RAM: 1GB  │  │ │RAM: 1GB  │  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │Auth Svc  │ │ │Auth Svc  │  │ │Auth Svc  │  │ │
│   │  │Container │ │ │Container │  │ │Container │  │ │
│   │  │2 replicas│ │ │2 replicas │  │ │2 replicas│  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │Training  │ │ │Training  │  │ │Training  │  │ │
│   │  │Service   │ │ │Service   │  │ │Service   │  │ │
│   │  │2 replicas│ │ │2 replicas │  │ │2 replicas│  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │Content   │ │ │Content   │  │ │Content   │  │ │
│   │  │Service   │ │ │Service   │  │ │Service   │  │ │
│   │  │2 replicas│ │ │2 replicas │  │ │2 replicas│  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │Payment   │ │ │Payment   │  │ │Payment   │  │ │
│   │  │Service   │ │ │Service   │  │ │Service   │  │ │
│   │  │2 replicas│ │ │2 replicas │  │ │2 replicas│  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   │  ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ │
│   │  │AI/ML Svc │ │ │AI/ML Svc │  │ │AI/ML Svc │  │ │
│   │  │1 instance│ │ │1 instance │  │ │1 instance│  │ │
│   │  │(high CPU)│ │ │(high CPU)  │  │ │(high CPU)│  │ │
│   │  │2048 RAM  │ │ │2048 RAM  │  │ │2048 RAM  │  │ │
│   │  └──────────┘ │ └──────────┘  │ └──────────┘  │ │
│   │                │                 │                │ │
│   └────────────────┴────────────────┴────────────────┘ │
│                                                          │
│   Auto Scaling Groups:                                  │
│   • Target: 70% CPU, 80% Memory                        │
│   • Scale-up: Add 1-2 tasks                            │
│   • Scale-down: Remove 1 task per minute               │
│   • Min replicas per service: 2 (high availability)    │
│   • Max replicas per service: 10 (auto-scale limit)    │
│                                                          │
│   Service Discovery:                                    │
│   • AWS Cloud Map (internal DNS)                       │
│   • Service names: auth-service.internal, etc.         │
│   • Health check: Container TCP port 8080              │
│                                                          │
└──────────────────────────────────────────────────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌────────────────────────────────────────────────────────┐
│          DATA LAYER (us-east-1)                       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   RDS PostgreSQL (Multi-AZ + Replicas)          │ │
│  │                                                  │ │
│  │   Primary: us-e1a (Active)                      │ │
│  │   • Instance: db.r6i.2xlarge                   │ │
│  │   • Storage: 1TB GP3 SSD                       │ │
│  │   • Max allocated: 5TB (auto-scaling)          │ │
│  │   • Backup: Daily, 35-day retention            │ │
│  │   • Multi-AZ Standby: us-e1b                  │ │
│  │   • Sync replication (0-lag failover)          │ │
│  │   • Read Replicas:                             │ │
│  │     - us-e1c (cross-AZ analytics)             │ │
│  │     - us-w2a (cross-region DR)                │ │
│  │                                                  │ │
│  │   Connection Management:                        │ │
│  │   • RDS Proxy: 300 max connections             │ │
│  │   • Pooling: Exponential backoff                │ │
│  │   • Statement timeout: 5 minutes               │ │
│  │   • Encryption: AES-256 KMS                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   ElastiCache Redis (Multi-AZ)                  │ │
│  │                                                  │ │
│  │   Cluster Configuration:                        │ │
│  │   • Node type: cache.r6g.xlarge                │ │
│  │   • Nodes: 2 (Primary + Replica)               │ │
│  │   • AZ distribution: us-e1a, us-e1b            │ │
│  │   • Auto failover: Enabled                     │ │
│  │   • Memory: 64GB total                         │ │
│  │   • Encryption: TLS in transit, AES at rest   │ │
│  │   • Backup: Daily snapshots, 35-day retention  │ │
│  │                                                  │ │
│  │   Use Cases:                                    │ │
│  │   • Session storage (TTL: 24 hours)            │ │
│  │   • Leaderboards & rankings                    │ │
│  │   • Rate limiting buckets                      │ │
│  │   • Cache hot data (LRU policy)                │ │
│  │   • Recommendation cache (5 min TTL)           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   RDS Read Replica (for Analytics)              │ │
│  │   • Instance: db.t3.xlarge                      │ │
│  │   • Purpose: Analytics queries only            │ │
│  │   • Lag: <100ms typical                         │ │
│  │   • Isolated from production traffic           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS OpenSearch Cluster                        │ │
│  │   • Instance: t3.medium.elasticsearch          │ │
│  │   • Nodes: 3 (multi-AZ)                        │ │
│  │   • Shards: 5 per index                        │ │
│  │   • Replicas: 1 per shard                      │ │
│  │   • Storage: 1TB per node                      │ │
│  │   • Use: Content search index                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
    │               │               │
    └───────────────┼───────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌────────────────────────────────────────────────────────┐
│       STORAGE & MESSAGING LAYER (us-east-1)          │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   S3 Buckets (Regional)                          │ │
│  │                                                  │ │
│  │   fitness-platform-videos/                      │ │
│  │   • Versioning: Enabled                         │ │
│  │   • Encryption: AES-256                         │ │
│  │   • Lifecycle: → Glacier (90 days)              │ │
│  │   • Cross-region replication: eu-w1             │ │
│  │   • Replicas: Delete after 1 year               │ │
│  │                                                  │ │
│  │   fitness-platform-images/                      │ │
│  │   • Versioning: Disabled                        │ │
│  │   • Storage class: Intelligent-Tiering          │ │
│  │   • Auto-archive: >30 days unused               │ │
│  │                                                  │ │
│  │   fitness-platform-backups/                     │ │
│  │   • Versioning: Enabled                         │ │
│  │   • Encryption: AES-256 + KMS                   │ │
│  │   • Lifecycle: → Glacier (7 days)               │ │
│  │   • Cross-region replication: us-w2             │ │
│  │   • Retention: 7+ years (regulatory)            │ │
│  │                                                  │ │
│  │   fitness-platform-analytics/                   │ │
│  │   • Export destination                          │ │
│  │   • Retention: 2 years                          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS SQS Queues (Standard)                      │ │
│  │                                                  │ │
│  │   Queue: email-notifications                    │ │
│  │   • Message retention: 14 days                  │ │
│  │   • Visibility timeout: 5 minutes               │ │
│  │   • Consumers: Email Lambda (2 concurrent)      │ │
│  │                                                  │ │
│  │   Queue: analytics-events                       │ │
│  │   • High throughput (1000+ msg/sec)             │ │
│  │   • Consumers: Analytics aggregator (10x)       │ │
│  │                                                  │ │
│  │   Queue: health-sync-jobs                       │ │
│  │   • Scheduled batch every 24 hours              │ │
│  │   • Consumers: Health sync Lambda                │ │
│  │                                                  │ │
│  │   Queue: payment-webhooks                       │ │
│  │   • From Stripe, Yandex, Sberbank               │ │
│  │   • Priority: FIFO if order matters             │ │
│  │   • Dead-letter queue for failed payments       │ │
│  │                                                  │ │
│  │   Queue: ai-recommendations                     │ │
│  │   • Background job generation                   │ │
│  │   • Hourly batch processing                     │ │
│  │   • Consumer: ML Service                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS SNS Topics (Fan-out)                       │ │
│  │                                                  │ │
│  │   Topic: payment-events                         │ │
│  │   • Subscribers: Payment queue, Analytics, UI   │ │
│  │                                                  │ │
│  │   Topic: user-events                            │ │
│  │   • Subscribers: Email service, Analytics       │ │
│  │                                                  │ │
│  │   Topic: content-events                         │ │
│  │   • Subscribers: Search index, CDN invalidate   │ │
│  │                                                  │ │
│  │   Topic: alerts                                 │ │
│  │   • Subscribers: Slack, Email, PagerDuty        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS Lambda Functions                          │ │
│  │   (Background Job Processors)                   │ │
│  │                                                  │ │
│  │   send_email_lambda:                            │ │
│  │   • Trigger: email-notifications SQS           │ │
│  │   • Runtime: Node.js 18                        │ │
│  │   • Memory: 256MB                              │ │
│  │   • Timeout: 30 seconds                        │ │
│  │   • Concurrency: 100 (provisioned)             │ │
│  │                                                  │ │
│  │   health_sync_lambda:                           │ │
│  │   • Trigger: EventBridge (0 5 * * * UTC)       │ │
│  │   • Runtime: Python 3.11                       │ │
│  │   • Memory: 1024MB                             │ │
│  │   • Timeout: 600 seconds                       │ │
│  │   • Ephemeral storage: 10GB                    │ │
│  │                                                  │ │
│  │   ai_recommendation_lambda:                     │ │
│  │   • Trigger: SQS health-sync-jobs               │ │
│  │   • Runtime: Python 3.11 + ML libraries        │ │
│  │   • Memory: 2048MB                             │ │
│  │   • Timeout: 300 seconds                       │ │
│  │   • EphemeralStorage: 5GB                      │ │
│  │                                                  │ │
│  │   encode_video_lambda:                          │ │
│  │   • Trigger: S3 video upload event              │ │
│  │   • Calls: AWS Elemental MediaConvert           │ │
│  │   • Job queue: Standard                         │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────────┐
│        MONITORING & LOGGING LAYER (us-east-1)        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS CloudWatch Logs                           │ │
│  │                                                  │ │
│  │   Log Groups:                                   │ │
│  │   • /aws/ecs/api-gateway (INFO, 30 days)       │ │
│  │   • /aws/ecs/auth-service (DEBUG, 7 days)      │ │
│  │   • /aws/ecs/payment-service (INFO, 180 days)  │ │
│  │   • /aws/lambda/email (INFO, 30 days)         │ │
│  │   • /aws/rds/postgresql (INFO, 90 days)       │ │
│  │   • /aws/vpc-flow-logs (30 days)               │ │
│  │   • /aws/apigateway/access (30 days)          │ │
│  │                                                  │ │
│  │   Log Retention: Variable by criticality        │ │
│  │   • Application logs: 30-90 days               │ │
│  │   • Errors: 180 days                           │ │
│  │   • Audit logs: 2 years                        │ │
│  │   • Security logs: 1 year (regulatory)         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS CloudWatch Metrics                        │ │
│  │                                                  │ │
│  │   Custom Metrics:                               │ │
│  │   • Signup/login rate                          │ │
│  │   • Payment success rate                       │ │
│  │   • API response time (p50, p95, p99)          │ │
│  │   • Error rates per endpoint                   │ │
│  │   • Database connections                       │ │
│  │   • Cache hit/miss rates                       │ │
│  │   • Queue depth (SQS messages)                 │ │
│  │                                                  │ │
│  │   Dashboard: Real-time monitoring              │ │
│  │   Refresh rate: 1-5 minutes                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   AWS X-Ray (Distributed Tracing)               │ │
│  │                                                  │ │
│  │   Trace configuration:                          │ │
│  │   • Sampling: ERROR=100%, POST=10%, GET=1%     │ │
│  │   • Service map generation: Automatic           │ │
│  │   • Latency analysis: Identify bottlenecks      │ │
│  │   • Error tracking: Root cause analysis         │ │
│  │   • Trace retention: 30 days                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   CloudWatch Alarms & SNS                       │ │
│  │                                                  │ │
│  │   Critical Alarms (Page on-call):               │ │
│  │   • Service down (> 2 failed checks)            │ │
│  │   • Error rate > 5% (5 min eval)                │ │
│  │   • RDS unavailable                            │ │
│  │   • DLQ has messages                           │ │
│  │   • Unauthorized login attempts > 100/hour      │ │
│  │                                                  │ │
│  │   High Priority (Slack alert):                  │ │
│  │   • Error rate 1-5% (10 min eval)              │ │
│  │   • Latency p95 > 2s (10 min eval)             │ │
│  │   • Certificate expiring < 7 days               │ │
│  │   • Disk usage > 85%                           │ │
│  │                                                  │ │
│  │   Medium Priority (Daily digest):               │ │
│  │   • Warnings > 50 in last hour                 │ │
│  │   • Memory usage > 80%                         │ │
│  │   • Failed backups                             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Disaster Recovery & Failover

```
┌────────────────────────────────────────────────────────────────┐
│             DISASTER RECOVERY ARCHITECTURE                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Primary Region: us-east-1 (Active)                           │
│  Secondary Region: eu-west-1 (Warm Standby)                  │
│  Tertiary Region: ap-southeast-1 (Cold Standby)              │
│                                                                │
│  Data Replication:                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  us-east-1 (Primary)                                   ││
│  │  ├─ RDS Primary                                        ││
│  │  │  ├─ Sync replicate to AZ-b (< 1ms)                ││
│  │  │  ├─ Async replicate to eu-w1 (≈100ms)             ││
│  │  │  └─ Async replicate to ap-se1 (≈200ms)            ││
│  │  │                                                    ││
│  │  ├─ S3 buckets                                        ││
│  │  │  ├─ Versioning: Enabled                           ││
│  │  │  ├─ Cross-region replication to eu-w1             ││
│  │  │  └─ Cross-region replication to ap-se1            ││
│  │  │                                                    ││
│  │  └─ ElastiCache                                       ││
│  │     └─ Not replicated (rebuilt on failover)           ││
│  │                                                          ││
│  │  eu-west-1 (Warm Standby)                             ││
│  │  ├─ RDS Read Replica                                 ││
│  │  │  └─ Promotable to Primary in 5-10 minutes         ││
│  │  ├─ S3 replicas                                       ││
│  │  │  └─ Automatic replication target                  ││
│  │  └─ Minimal ECS capacity (1 task per service)        ││
│  │     └─ Can scale up if failover needed                ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  RPO (Recovery Point Objective):                              │
│  ├─ Database: 1 hour (1-hour backup frequency)              │
│  ├─ S3 objects: Real-time (event-based replication)         │
│  ├─ Configuration: Real-time (in Git/Terraform)             │
│  └─ Cache: 0 (rebuilt on demand)                            │
│                                                                │
│  RTO (Recovery Time Objective):                              │
│  ├─ Single service restart: < 2 minutes                    │
│  ├─ Database failover: < 2 minutes (RDS Multi-AZ)          │
│  ├─ Regional failover: 5-15 minutes (Route 53 + restore)   │
│  └─ Cross-region failover: 15-30 minutes (manual)           │
│                                                                │
│  Failover Scenarios:                                          │
│                                                                │
│  1. Single ECS Task Failure:                                  │
│     ├─ Auto-scaling replaces task (< 1 min)                 │
│     ├─ No service disruption (other replicas active)        │
│     └─ CloudWatch alert sent to ops team                    │
│                                                                │
│  2. Multi-AZ Database Failover:                              │
│     ├─ RDS detects primary failure                          │
│     ├─ Automatic failover to standby (< 2 min)              │
│     ├─ DNS endpoints updated automatically                  │
│     ├─ Applications reconnect automatically                 │
│     └─ No data loss (synchronous replication)              │
│                                                                │
│  3. Region Outage (us-east-1):                              │
│     ├─ Route 53 health check fails (60 sec TTL)             │
│     ├─ DNS redirects to eu-west-1                          │
│     ├─ Promote read replica to Primary                      │
│     ├─ Scale up ECS capacity in eu-west-1                  │
│     ├─ Data loss: < 1 hour (async replication lag)          │
│     └─ Service recovery: 10-15 minutes                      │
│                                                                │
│  4. Database Corruption:                                      │
│     ├─ Restore from daily snapshot                          │
│     ├─ Point-in-time recovery available (35 days)           │
│     ├─ Restore to staging first for validation              │
│     ├─ Failover to restored database                        │
│     └─ Data loss: Depends on corruption detection time      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Network Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    VPC NETWORK TOPOLOGY                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  VPC CIDR: 10.0.0.0/16                                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Public Subnets (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)│ │
│  │  ├─ ALB                                                 │ │
│  │  ├─ NAT Gateways (3x for high availability)            │ │
│  │  ├─ Bastion Host (optional, for SSH access)           │ │
│  │  └─ AWS Systems Manager Session Manager endpoints      │ │
│  │     (preferred alternative to bastion)                │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                      │
│         │                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Private Subnets - Application (10.0.10-12.0/24)       │ │
│  │  ├─ ECS Fargate tasks (no direct internet access)      │ │
│  │  ├─ NAT through NAT Gateway                            │ │
│  │  ├─ VPC Endpoints for AWS services (no NAT needed)    │ │
│  │  └─ Security group: ALB ingress only                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                      │
│         │                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Private Subnets - Database (10.0.20-21.0/24)          │ │
│  │  ├─ RDS PostgreSQL Primary/Standby                     │ │
│  │  ├─ RDS Proxy for connection pooling                  │ │
│  │  ├─ Read replica (cross-AZ for analytics)             │ │
│  │  └─ Security group: ECS ingress only (port 5432)     │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                      │
│         │                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Private Subnets - Cache (10.0.30-31.0/24)             │ │
│  │  ├─ ElastiCache Redis Primary/Replica                  │ │
│  │  └─ Security group: ECS ingress only (port 6379)      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  VPC Endpoints (Gateway & Interface):                         │
│  ├─ S3 Gateway Endpoint                                      │
│  ├─ DynamoDB Gateway Endpoint                                │
│  ├─ Secrets Manager Interface Endpoint                       │
│  ├─ Systems Manager Interface Endpoint                       │
│  ├─ CloudWatch Logs Interface Endpoint                       │
│  └─ SNS/SQS Interface Endpoints                              │
│     (for Lambda/ECS without NAT)                             │
│                                                                │
│  Security Group Rules:                                        │
│  ├─ ALB SG:                                                  │
│  │  ├─ Inbound: 80/tcp, 443/tcp from 0.0.0.0/0             │
│  │  └─ Outbound: All to ECS SG                             │
│  │                                                           │
│  ├─ ECS SG:                                                  │
│  │  ├─ Inbound: All ports from ALB SG                      │
│  │  ├─ Inbound: Port 22 from Bastion SG (if used)          │
│  │  ├─ Outbound: 443/tcp to 0.0.0.0/0 (HTTPS only)        │
│  │  ├─ Outbound: 5432/tcp to RDS SG                        │
│  │  └─ Outbound: 6379/tcp to Redis SG                      │
│  │                                                           │
│  ├─ RDS SG:                                                  │
│  │  ├─ Inbound: 5432/tcp from ECS SG                       │
│  │  └─ Outbound: None (database doesn't initiate)          │
│  │                                                           │
│  └─ Redis SG:                                               │
│     ├─ Inbound: 6379/tcp from ECS SG                        │
│     └─ Outbound: None (cache doesn't initiate)              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Infrastructure as Code (Terraform) Structure

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── terraform.tfvars
│   │   └── main.tf (dev-specific overrides)
│   ├── staging/
│   │   ├── terraform.tfvars
│   │   └── main.tf
│   └── prod/
│       ├── terraform.tfvars
│       └── main.tf
├── modules/
│   ├── networking/
│   │   ├── vpc.tf
│   │   ├── subnets.tf
│   │   └── security_groups.tf
│   ├── ecs/
│   │   ├── cluster.tf
│   │   ├── services.tf
│   │   └── task_definitions.tf
│   ├── database/
│   │   ├── rds.tf
│   │   └── backups.tf
│   ├── cache/
│   │   └── elasticache.tf
│   ├── storage/
│   │   └── s3.tf
│   └── monitoring/
│       ├── cloudwatch.tf
│       ├── alarms.tf
│       └── logging.tf
├── main.tf
├── variables.tf
├── outputs.tf
└── terraform.tfstate (git-ignored)
```

## Deployment Pipeline

```
Code Commit → GitHub
    ↓
GitHub Actions
    ├─ Lint & Format checks
    ├─ Unit tests
    ├─ Security scanning (Snyk, OWASP)
    └─ Build Docker images
       ↓
Push to Amazon ECR
    ↓
Terraform Plan (staging)
    ↓
Manual Approval
    ↓
Deploy to Staging
    ├─ Run integration tests
    ├─ Smoke tests
    └─ Performance benchmarks
    ↓
Manual Approval (Production)
    ↓
Deploy to Production (Blue-Green)
    ├─ Blue (current)
    ├─ Green (new version)
    ├─ Health checks on green
    └─ Traffic switch after validation
    ↓
Post-Deployment
    ├─ Smoke tests
    ├─ Rollback if failed
    └─ Monitoring alerts enabled
```
