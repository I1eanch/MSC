# ADR 001: Technology Stack Selection

**Status**: Accepted

**Date**: 2024

**Context**

The platform requires a scalable, maintainable technology stack capable of handling millions of users with complex business logic across multiple domains (authentication, training, content delivery, payments, AI services). The solution must support rapid development, easy deployment, and seamless integration with third-party services.

**Decision**

We adopt the following technology stack:

### Backend
- **Language**: TypeScript/Node.js (Express.js or NestJS)
- **API**: REST with GraphQL support for flexible data queries
- **Async Processing**: AWS SQS + Workers or RabbitMQ
- **Caching**: Redis (in-memory, session management, rate limiting)
- **ORM**: TypeORM or Sequelize with connection pooling

### Database
- **Primary**: PostgreSQL 15+ (RDS)
- **Real-time**: Redis Streams for event streaming
- **Document Store**: Optional MongoDB for unstructured content
- **Search**: Elasticsearch for full-text search on content

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux or Zustand
- **Mobile**: React Native for iOS/Android apps
- **Build Tool**: Vite or Webpack

### Infrastructure & Deployment
- **Container Orchestration**: AWS ECS (Elastic Container Service) Fargate
- **Serverless Functions**: AWS Lambda for background jobs, webhooks
- **Load Balancing**: AWS Application Load Balancer (ALB)
- **API Gateway**: AWS API Gateway with rate limiting, authentication
- **CDN**: CloudFront for static assets and video distribution
- **Media Storage**: AWS S3 with lifecycle policies
- **Video Streaming**: HLS/DASH via CloudFront or specialized CDN

### Message Queues & Events
- **Primary**: AWS SQS for decoupled async operations
- **Fallback**: RabbitMQ for more complex routing scenarios
- **Event Streaming**: AWS Kinesis or Kafka for real-time analytics

### Security & Authentication
- **OAuth 2.0 / OIDC**: Support for Google, Apple, Yandex, VK OAuth providers
- **API Key Management**: AWS Secrets Manager
- **SSL/TLS**: AWS Certificate Manager
- **Token Management**: JWT with rotating refresh tokens

### Monitoring & Logging
- **Logging**: CloudWatch Logs + ELK Stack or DataDog
- **Metrics**: CloudWatch Metrics + Prometheus/Grafana
- **Tracing**: AWS X-Ray or Jaeger for distributed tracing
- **APM**: DataDog or New Relic for application performance monitoring
- **Alerts**: CloudWatch Alarms + SNS

### CI/CD
- **Version Control**: GitHub
- **CI/CD Pipeline**: GitHub Actions or AWS CodePipeline
- **Container Registry**: Amazon ECR
- **Infrastructure as Code**: Terraform or CloudFormation

### AI/ML Services
- **Personalization**: AWS SageMaker for model training and inference
- **NLP**: AWS Comprehend for text analysis
- **Computer Vision**: AWS Rekognition for image/video analysis
- **Microservices**: Containerized Python/FastAPI services for ML workloads

## Rationale

1. **TypeScript/Node.js**: Enables code sharing between backend and frontend, faster development cycles, and large ecosystem of packages.

2. **PostgreSQL**: ACID compliance, advanced features (JSONB, arrays, extensions), and superior performance for complex queries compared to NoSQL alternatives.

3. **AWS ECS Fargate**: Eliminates infrastructure management, provides auto-scaling, integrates seamlessly with other AWS services, and offers cost efficiency.

4. **CloudFront + S3**: Provides global content distribution with low latency, integrates with AWS ecosystem, and offers cost-effective large-scale storage.

5. **Redis**: Exceptional performance for session management, caching, and rate limiting without the overhead of database queries.

6. **Elasticsearch**: Enables powerful full-text search capabilities essential for discovering training content.

7. **AWS Lambda**: Cost-effective for background jobs with variable load, integrates with other AWS services (S3 events, SQS).

8. **JWT + OAuth**: Industry-standard authentication mechanisms that provide security, statelessness, and third-party integration.

## Consequences

**Positive**:
- Unified JavaScript ecosystem reduces cognitive load for developers
- AWS integration provides operational simplicity and reduced vendor lock-in risk
- Horizontal scalability through containerization
- Real-time capabilities with Redis/Kafka
- Comprehensive AWS monitoring and security features

**Negative**:
- AWS vendor lock-in (mitigated by containerization and terraform abstraction)
- TypeScript compilation overhead (minimal impact with proper tooling)
- Requires operational expertise in containerization and microservices patterns
- Multiple data stores increase operational complexity

## Alternatives Considered

1. **Python/Django**: Slower startup times, not ideal for real-time applications
2. **Go/Gin**: Excellent performance but smaller ecosystem for AI/ML integrations
3. **Java/Spring Boot**: Heavier resource requirements, steeper learning curve
4. **Azure Stack**: Similar capabilities but team has existing AWS expertise
5. **On-premises**: Requires significant DevOps investment, less agile scaling

## Related ADRs

- [ADR 002: Domain Boundaries](./002-domain-boundaries.md)
- [ADR 003: Deployment Topology](./003-deployment-topology.md)
