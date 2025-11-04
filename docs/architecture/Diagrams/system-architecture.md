# System Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                    │
│  │  Web Browser   │  │  iOS App       │  │  Android App   │                    │
│  │  (React)       │  │  (React Native)│  │  (React Native)│                    │
│  └────────────────┘  └────────────────┘  └────────────────┘                    │
│           │                   │                   │                              │
└───────────┼───────────────────┼───────────────────┼──────────────────────────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   AWS CloudFront       │
                    │   (Global CDN)         │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
        │                   EDGE LAYER                   │
        │                                               │
        │  ┌──────────────────────────────────────────┐ │
        │  │   AWS Route 53                           │ │
        │  │   - DNS Resolution                       │ │
        │  │   - Health Checks                        │ │
        │  │   - Geolocation Routing                  │ │
        │  └──────────────────────────────────────────┘ │
        │                     │                          │
        └─────────────────────┼──────────────────────────┘
                              │
        ┌─────────────────────▼──────────────────────┐
        │                                             │
        │         AWS Application Load Balancer      │
        │         - SSL/TLS Termination              │
        │         - Request Routing                  │
        │         - Health Checking                  │
        │                                             │
        └──────────────┬──────────────┬───────────────┘
                       │              │
        ┌──────────────▼─┐  ┌────────▼────────────┐
        │  API Gateway   │  │  Image/Static CDN   │
        │  (Rate Limiting)│  │  CloudFront         │
        └──────────────┬─┘  └────────┬────────────┘
                       │              │
        ┌──────────────┴──────────────┴────────────┐
        │                                          │
        │        APPLICATION LAYER (ECS)          │
        │        Multi-AZ Deployment              │
        │                                          │
        │  AZ-1          AZ-2          AZ-3       │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │API│         │API│        │API│      │
        │  │Svc│         │Svc│        │Svc│      │
        │  └─┬─┘         └─┬─┘        └─┬─┘      │
        │    │             │            │        │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │Auth        │Auth        │Auth       │
        │  │Svc │        │Svc │        │Svc │      │
        │  └─┬─┘         └─┬─┘        └─┬─┘      │
        │    │             │            │        │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │Training    │Training    │Training   │
        │  │Svc │        │Svc │        │Svc │      │
        │  └─┬─┘         └─┬─┘        └─┬─┘      │
        │    │             │            │        │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │Content     │Content     │Content    │
        │  │Svc │        │Svc │        │Svc │      │
        │  └─┬─┘         └─┬─┘        └─┬─┘      │
        │    │             │            │        │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │Payment     │Payment     │Payment    │
        │  │Svc │        │Svc │        │Svc │      │
        │  └─┬─┘         └─┬─┘        └─┬─┘      │
        │    │             │            │        │
        │  ┌───┐         ┌───┐        ┌───┐      │
        │  │AI/ML       │AI/ML       │AI/ML      │
        │  │Svc │        │Svc │        │Svc │      │
        │  └───┘         └───┘        └───┘      │
        │                                          │
        └────────────┬─────────────────────────────┘
                     │
        ┌────────────┼────────────────────┐
        │            │                    │
    ┌───▼────┐  ┌───▼────────┐      ┌───▼─────┐
    │   RDS  │  │  ElastiCache       │   S3    │
    │PostgreSQL  │     Redis     │   │  Storage │
    │(Multi-AZ)  │  (Multi-AZ)  │   │          │
    └────────┘   └──────────────┘   └──────────┘
        │             │                  │
        └────────┬────┴──────────────────┘
                 │
        ┌────────▼─────────────────┐
        │   AWS SQS/SNS            │
        │   Message Queues         │
        │   Event Distribution     │
        └────────┬─────────────────┘
                 │
        ┌────────▼─────────────────┐
        │   AWS Lambda             │
        │   Background Workers     │
        │   - Email Notifications  │
        │   - Analytics Processing │
        │   - Health Sync          │
        └────────┬─────────────────┘
                 │
        ┌────────▼─────────────────┐
        │   OpenSearch/ElasticSeah  │
        │   Content Search Index   │
        └────────┬─────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼─────┐         ┌────────▼───┐
│CloudWatch    │     │   X-Ray     │
│(Logs &    │     │(Tracing)    │
│ Metrics) │     │             │
└──────────┘     └─────────────┘
```

## Service Boundaries (Microservices)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOMAIN-DRIVEN BOUNDARIES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐      ┌──────────────────┐                   │
│  │ Authentication   │      │   Training &     │                   │
│  │ & Authorization  │      │   Workouts       │                   │
│  │                  │      │                  │                   │
│  │ - OAuth 2.0      │◄──►  │ - Workout Plans  │                   │
│  │ - JWT Tokens     │      │ - Exercises      │                   │
│  │ - MFA            │      │ - Sessions       │                   │
│  │ - RBAC           │      │ - Progress       │                   │
│  └──────────────────┘      └────────┬─────────┘                   │
│           ▲                         │                              │
│           │              ┌──────────▼──────────┐                  │
│           │              │  Content Management │                  │
│           │              │                     │                  │
│           │              │ - Courses          │                  │
│           │              │ - Videos           │                  │
│           │              │ - Articles         │                  │
│           │              │ - Search Index     │                  │
│           │              └──────────┬──────────┘                  │
│           │                         │                              │
│  ┌────────┴────────┐               │              ┌───────────┐  │
│  │   Subscription  │◄──────────────┴─────────────►│ Payments  │  │
│  │                 │                               │           │  │
│  │ - Plans         │                               │ - Gateways│  │
│  │ - Lifecycle     │                               │ - Invoices│  │
│  │ - Renewal       │                               │ - Refunds │  │
│  └─────────────────┘                               └───────────┘  │
│           │                                              │         │
│           │              ┌──────────────────┐           │         │
│           │              │  Health Metrics  │           │         │
│           │              │  & Tracking      │           │         │
│           │              │                  │           │         │
│           └─────────────►│ - Integrations   │◄──────────┘         │
│                          │ - Goals          │                      │
│                          │ - Analytics      │                      │
│                          └────────┬─────────┘                      │
│                                   │                                │
│                    ┌──────────────▼──────────────┐                 │
│                    │   AI & Personalization     │                 │
│                    │                             │                 │
│                    │ - Recommendations           │                 │
│                    │ - Content Ranking           │                 │
│                    │ - Predictions               │                 │
│                    └────────┬──────────────────┘                  │
│                             │                                      │
│                    ┌────────▼─────────────┐                       │
│                    │  Analytics & Reporting│                      │
│                    │                       │                      │
│                    │ - Event Streaming    │                       │
│                    │ - Dashboards         │                       │
│                    │ - Business Intel     │                       │
│                    └───────────────────────┘                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
Users
  ↓
┌─────────────────────────────────────────┐
│  API Gateway (Authentication)           │
│  - Rate Limiting                        │
│  - JWT Validation                       │
│  - Request Routing                      │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┼────────────────┐
        │            │                │
    ┌───▼────┐  ┌───▼────┐      ┌───▼────┐
    │  Auth  │  │ Domain │      │ Domain │
    │Service │  │Service │      │Service │
    └────┬───┘  └────┬───┘      └────┬───┘
         │           │               │
         │     ┌─────▼────────┐      │
         │     │  PostgreSQL  │      │
         │     │   Database   │      │
         │     └──────┬───────┘      │
         │            │              │
         │     ┌──────▼──────┐       │
         │     │Redis Cache  │       │
         │     └──────┬──────┘       │
         │            │              │
         └────────────┼──────────────┘
                      │
         ┌────────────▼────────────┐
         │  Event Bus (SQS/SNS)    │
         │  - Domain Events       │
         │  - Service Notifications│
         └────────────┬────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
    ┌───▼────┐  ┌────▼────┐   ┌────▼──────┐
    │Lambda  │  │Analytics│   │External   │
    │Workers │  │Service  │   │Integrations
    └────────┘  └────────┘    └───────────┘
```

## Infrastructure Deployment

```
┌─────────────────────────────────────────────────────┐
│              AWS INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  REGION: us-east-1                                 │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐              │
│  │     AZ-1a    │  │     AZ-1b    │              │
│  │              │  │              │              │
│  │ ┌──────────┐ │  │ ┌──────────┐ │              │
│  │ │ECS Task  │ │  │ │ECS Task  │ │              │
│  │ │Container1 │ │  │ │Container1 │ │              │
│  │ │Container2 │ │  │ │Container2 │ │              │
│  │ │Container3 │ │  │ │Container3 │ │              │
│  │ └──────────┘ │  │ └──────────┘ │              │
│  │              │  │              │              │
│  └──────────────┘  └──────────────┘              │
│        ▲                 ▲                         │
│        └─────────────────┘                         │
│              ALB                                   │
│              (Route 53)                            │
│                                                    │
│  Database Layer:                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │   RDS PostgreSQL (Multi-AZ Primary)        │ │
│  │   ├─ Primary in AZ-1a                      │ │
│  │   └─ Standby in AZ-1b (Sync Replication)  │ │
│  │   Read Replicas:                            │ │
│  │   ├─ Cross-AZ Replica                      │ │
│  │   └─ Cross-Region Replica (us-west-2)     │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
│  Cache Layer:                                      │
│  ┌─────────────────────────────────────────────┐ │
│  │   ElastiCache Redis (Multi-AZ)             │ │
│  │   ├─ Primary Node in AZ-1a                 │ │
│  │   └─ Replica in AZ-1b                      │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
│  Storage:                                          │
│  ┌─────────────────────────────────────────────┐ │
│  │   S3 Buckets (Region: us-east-1)          │ │
│  │   ├─ Videos                                │ │
│  │   ├─ Images                                │ │
│  │   ├─ Backups                               │ │
│  │   └─ Analytics Exports                     │ │
│  │                                             │ │
│  │   Cross-Region Replication:                │ │
│  │   ├─ Videos → eu-central-1 (Frankfurt)    │ │
│  │   └─ Backups → us-west-2 (Oregon)         │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
│  Messaging:                                        │
│  ┌─────────────────────────────────────────────┐ │
│  │   AWS SQS / SNS                            │ │
│  │   ├─ Email Queue                           │ │
│  │   ├─ Analytics Queue                       │ │
│  │   ├─ Health Sync Queue                     │ │
│  │   └─ Payment Webhook Queue                 │ │
│  │                                             │ │
│  │   AWS Lambda Consumers:                    │ │
│  │   ├─ Email Lambda                          │ │
│  │   ├─ Analytics Aggregator                  │ │
│  │   └─ Health Sync Worker                    │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Network Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└────────────────────────┬─────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   AWS CloudFront   │
              │   WAF + Shield DDoS│
              └──────────┬─────────┘
                         │
              ┌──────────▼──────────┐
              │  Route 53 DNS      │
              │  Health Checks     │
              └──────────┬─────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        │   AWS VPC (10.0.0.0/16)        │
        │                                  │
        │  ┌──────────────────────────┐  │
        │  │  Public Subnets          │  │
        │  │  - ALB (10.0.1.0/24)     │  │
        │  │  - NAT Gateway (10.0.2/24)│ │
        │  └──────────────┬───────────┘  │
        │                 │               │
        │  ┌──────────────▼───────────┐  │
        │  │  Private Subnets         │  │
        │  │  - ECS Fargate (3 AZs)   │  │
        │  │    * 10.0.10.0/24 (AZ-1) │  │
        │  │    * 10.0.11.0/24 (AZ-2) │  │
        │  │    * 10.0.12.0/24 (AZ-3) │  │
        │  └──────────────┬───────────┘  │
        │                 │               │
        │  ┌──────────────▼───────────┐  │
        │  │  Database Subnets        │  │
        │  │  - RDS (Multi-AZ)        │  │
        │  │    * 10.0.20.0/24 (AZ-1) │  │
        │  │    * 10.0.21.0/24 (AZ-2) │  │
        │  └──────────────┬───────────┘  │
        │                 │               │
        │  ┌──────────────▼───────────┐  │
        │  │  Cache Subnets           │  │
        │  │  - Redis (Multi-AZ)      │  │
        │  │    * 10.0.30.0/24 (AZ-1) │  │
        │  │    * 10.0.31.0/24 (AZ-2) │  │
        │  └──────────────────────────┘  │
        │                                  │
        │  ┌──────────────────────────┐  │
        │  │  VPC Endpoints           │  │
        │  │  - S3 Gateway Endpoint   │  │
        │  │  - DynamoDB              │  │
        │  │  - Secrets Manager       │  │
        │  │  - CloudWatch Logs       │  │
        │  └──────────────────────────┘  │
        │                                  │
        └──────────────────────────────────┘
             │
     External Services
     - OAuth Providers
     - Payment Gateways
     - Health Integrations
     - AI/ML Services
```

## Key Design Principles

1. **High Availability**: Multi-AZ deployment across all critical components
2. **Scalability**: Horizontal scaling via ECS auto-scaling groups
3. **Isolation**: Domain-driven design with service boundaries
4. **Observability**: Distributed tracing and comprehensive logging
5. **Security**: VPC isolation, encryption at rest and in transit
6. **Resilience**: Circuit breakers, retries, graceful degradation
7. **Data Integrity**: ACID compliance with PostgreSQL ACID guarantees
8. **Performance**: Caching, CDN, and database optimization
