# ADR 006: Security, Compliance & Operations

**Status**: Accepted

**Date**: 2024

**Context**

The platform handles sensitive user health data, payment information, and personal details, requiring robust security controls and compliance with international data protection regulations. Additionally, operational requirements demand comprehensive monitoring, logging, and backup strategies.

**Decision**

We implement the following security, compliance, and operational controls:

## Security Architecture

### Authentication & Authorization

**Multi-Factor Authentication (MFA)**:

Supported methods:
- SMS-based OTP (6-digit, 5-minute validity)
- Email-based OTP (8-character, 10-minute validity)
- Time-based OTP (TOTP) via authenticator apps
- Backup codes (10x 8-character codes, one-time use)

**Implementation**:

```typescript
// MFA verification flow
async function verifyMFA(userId, method, code) {
  // Verify code validity
  // Check attempt count (max 5 attempts per code)
  // Mark as verified in session
  // Log MFA verification attempt
}

// Password requirements
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  expirationDays: 90,
  preventReuseCount: 5
};
```

**Session Management**:
- JWT expires: 15 minutes (access token)
- Refresh token expires: 30 days
- Device tracking: Max 5 concurrent sessions per user
- Logout on password change: Invalidate all existing tokens
- Geo-fencing: Alert on login from new country

### API Security

**Rate Limiting**:

```
Per-user limits:
- Authentication: 5 attempts/min per IP
- Public API: 100 requests/min
- Authenticated API: 1000 requests/min
- Payment operations: 10 requests/min

Per-IP limits:
- General: 10,000 requests/hour
- Authentication: 50 requests/min
- Bulk operations: 100 requests/min
```

**CORS Policy**:

```typescript
const corsConfig = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.MOBILE_APP_DOMAIN
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400 // 24 hours
};
```

**CSRF Protection**:
- SameSite cookie attribute: Strict
- CSRF token in double-submit cookie pattern
- Validate origin header

### Data Encryption

**Encryption at Rest**:

```
Database layer:
- AWS RDS encryption with KMS keys
- Algorithm: AES-256
- Key rotation: Annual
- Backup encryption: Same key

Application layer (sensitive fields):
- Encrypted columns: OAuth tokens, health integration tokens
- Encryption: AES-256-GCM
- Key storage: AWS Secrets Manager
- IV: Random per record

File storage:
- S3 server-side encryption: AES-256
- KMS key: Customer-managed
- Multipart upload: Encrypted in transit
```

**Encryption in Transit**:

```
- TLS 1.3 minimum (TLS 1.2 for legacy clients)
- Certificate: AWS Certificate Manager (auto-renewal)
- Perfect forward secrecy: Enabled
- HTTP Strict Transport Security (HSTS): max-age=31536000
- Secure cookies: Secure + SameSite=Strict
```

**Key Management**:

```
AWS Secrets Manager:
- Application secrets (API keys, passwords)
- Rotation: Automated (every 30 days)
- Versioning: Keep last 5 versions
- Audit logging: All access logged in CloudTrail

AWS KMS:
- Master key for database encryption
- Separate keys per environment (dev, staging, prod)
- Key policy: Principle of least privilege
- Backup: Stored in separate region
```

### Network Security

**VPC Architecture**:

```
Public Subnet:
- NAT Gateway (egress)
- Application Load Balancer

Private Subnet:
- ECS Fargate tasks (no internet access)
- RDS Multi-AZ (accessible only from ECS SG)
- ElastiCache Redis (accessible only from ECS SG)

Management Subnet:
- Bastion host (SSH access to private resources)
- VPN endpoint
- AWS Systems Manager Session Manager (preferred)
```

**Security Groups**:

```
ALB-SG:
  Inbound: 80/tcp (HTTP), 443/tcp (HTTPS)
  Outbound: To ECS-SG

ECS-SG:
  Inbound: From ALB-SG (all ports)
  Outbound: To RDS-SG, Redis-SG, 0.0.0.0:443 (HTTPS)

RDS-SG:
  Inbound: From ECS-SG (5432/tcp)
  Outbound: None (database doesn't initiate)

Redis-SG:
  Inbound: From ECS-SG (6379/tcp)
  Outbound: None
```

**AWS WAF Rules**:

- IP reputation: Block known malicious IPs
- Rate-based: 2000 requests/5 minutes from single IP
- Geo-blocking: Block access from unsupported countries (optional)
- Bot control: Identify and block bot traffic
- SQL injection: Detect and block SQL injection attempts
- XSS: Detect and block XSS payloads

### Secrets Management

**Environment-Specific Secrets**:

```
Development:
- Non-production API keys
- Local database credentials
- Test payment gateway keys

Staging:
- Production-like configuration
- Real (but test) external service keys
- Monitoring enabled

Production:
- Sensitive credentials in AWS Secrets Manager
- Automatic rotation enabled
- Audit logging mandatory
- Access via IAM roles only
```

**Secret Rotation**:

```
Policy: Rotate every 30 days

Secrets Manager automation:
1. Generate new secret version
2. Update application configuration
3. Test connectivity
4. Promote to active version
5. Notify on-call team
6. Archive old version (retention: 90 days)
```

## Compliance Requirements

### GDPR (General Data Protection Regulation)

**Data Subject Rights Implementation**:

```
Right to Access (Article 15):
- User can download personal data in JSON format
- Includes: profile, activity, health metrics, payments
- Format: Machine-readable, standard format
- Timeframe: 30 days max
- Automated API endpoint: GET /user/data/export

Right to Rectification (Article 16):
- Update incorrect personal data via API/UI
- Audit trail of changes
- Notify affected systems

Right to Erasure (Article 17, "Right to be Forgotten"):
- Delete user account and all personal data
- Exceptions: Legal/regulatory retention (payments: 7 years)
- Anonymization: Replace sensitive fields with UUIDs
- Timeframe: 30 days for complete deletion

Right to Data Portability (Article 20):
- Export data in standard format (CSV, JSON)
- Include: All data user generated/provided
- Timeframe: 30 days
- Automated: Scheduled downloads available

Right to Restrict Processing (Article 18):
- Users can restrict processing of their data
- Data retained but not used for analytics
- Exception: Legal/fraud prevention

Right to Object (Article 21):
- Opt-out of marketing communications
- Opt-out of profiling/targeting
- Automated: API endpoint and UI settings
```

**Lawful Basis for Processing**:

```
Contract (Article 6.1.b):
- Performance of subscription contract
- Payment processing
- Content delivery

Consent (Article 6.1.a):
- Marketing communications
- Analytics and profiling
- Health data processing
- Implementation: Explicit opt-in, easy withdrawal

Legitimate Interest (Article 6.1.f):
- Fraud detection
- Security improvements
- Service optimization
- Impact assessment conducted
```

**Data Protection Impact Assessment (DPIA)**:
- Conducted for high-risk processing (health data, AI profiling)
- Updated annually or on significant changes
- Includes: Purpose, necessity, risks, mitigations

**Data Retention Policy**:

```
User Account:
- Active account: Indefinite (user responsibility to delete)
- Deleted account: 90 days (hard delete)
- Soft delete grace period: 30 days (recovery option)

Payment Records:
- Compliance requirement: 7 years
- PCI-DSS: 1 year minimum
- Tokenized: Long-term storage (for recovery)
- Raw card details: Not stored

Health Metrics:
- Default retention: 2 years
- User configurable: 1-7 years
- Right to erasure: Immediate (with delay for backups)

Marketing Data:
- Consent records: 3 years
- Email preferences: Until account deletion
- Engagement logs: 1 year

Logs & Audit Trails:
- Application logs: 90 days
- Access logs: 30 days
- Audit logs: 2 years (regulatory)
- Error logs: 180 days
```

**GDPR Documentation**:
- Data Processing Agreement (DPA) with all sub-processors
- Privacy Policy (transparent, plain language)
- Consent management system (easy withdrawal)
- Incident notification: <72 hours to authorities

---

### Russian Data Protection (Federal Law 152-FZ)

**Specific Requirements**:

**Personal Data Storage in Russia**:
- Russian residents' data must be stored/processed in Russia
- Primary: AWS us-east-1 region (US)
- Secondary: AWS eu-central-1 region (Frankfurt, EU)
- Compliance: Use encrypted replication with data residency controls

**Notification Requirements**:
- Breach notification to authorities within 2 days
- Implementation: Automated CloudTrail → Lambda → Report generation

**Data Subject Rights**:
- Similar to GDPR but stricter in some aspects
- Access: Within 30 days
- Correction: Within 10 business days
- Deletion: Possible for some categories

**Prohibited Data Categories**:
- Ethnic origin (collect: No)
- Political opinions (collect: No)
- Religion/belief (collect: No)
- Health data (collect: Only with explicit consent)
- Genetic data (collect: Prohibited)
- Biometric data (collect: Only with explicit consent)

**Data Protection Officer (DPO)**:
- Designated for organization
- Available to: Public (transparency@platform.ru)
- Role: Monitor compliance, handle requests

**Special Protection for Children**:
- Age < 14: Parental consent required
- Verifiable parental consent mechanism
- Warning to parents during signup

---

### PCI-DSS (Payment Card Industry Data Security Standard)

**Requirement 1: Firewall Configuration**
- AWS WAF rules defined above
- No direct internet access to cardholder database

**Requirement 2: Default Security Parameters**
- No default passwords
- No unnecessary services running
- Secure configuration baseline

**Requirement 3: Data Protection**
- No storage of magnetic stripe (Track 2) data
- No storage of 3-digit security code (CVV)
- Encrypted storage of full PAN (if necessary)
- Tokenization preferred (Stripe handles this)

**Requirement 4: Encryption in Transit**
- TLS 1.2+ for all cardholder data transmission
- Strong encryption algorithms (AES-256)
- Certificate management

**Requirement 5-8: Vulnerability Management & Access Control**
- Regular security assessments (quarterly)
- Penetration testing (annual)
- Anti-malware on all systems
- Strong access controls (IAM roles, least privilege)

**Requirement 9-12: Physical & Operational Security**
- Monitoring and testing (CloudWatch, X-Ray)
- Information security policy (documented)
- Data processing agreements with third parties (Stripe, etc.)

**Compliance Approach**:
- Payment processing: Delegated entirely to Stripe (Level 1 PCI-DSS certified)
- Tokenization: Store Stripe tokens, not card details
- SAQ A-EP (Stripe Certified Merchant): Minimal PCI scope

---

## Monitoring & Observability

### Application Performance Monitoring (APM)

**Metrics Tracked**:

```
Performance:
- Response time (p50, p95, p99)
- Throughput (requests/sec)
- Error rate by endpoint
- Database query performance
- Cache hit rates

Business:
- User signups (daily, weekly)
- Subscription conversions
- Payment success rate
- Content completion rate
- Churn rate

Infrastructure:
- CPU/memory utilization
- Disk I/O and storage
- Network latency
- Connection pool status
- Queue depth (SQS, etc.)
```

### Logging Strategy

**Log Levels & Retention**:

```
ERROR: 180 days
  - Application errors
  - Payment failures
  - Authentication failures
  - Service unavailability

WARN: 90 days
  - Rate limit exceeded
  - Retry attempts
  - Degraded performance
  - Deprecated API usage

INFO: 30 days
  - Login/logout events
  - Subscription changes
  - Content access
  - Payment initiation

DEBUG: 7 days
  - Detailed request/response
  - Database queries
  - Cache operations
  - Only in staging/development

TRACE: Real-time only
  - System calls
  - Memory allocations
  - Used for investigation only
```

**Structured Logging**:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "service": "payment-service",
  "requestId": "uuid-here",
  "userId": "hash(uuid)", // Pseudonymized
  "action": "payment.initiated",
  "gateway": "stripe",
  "amountCents": 9999,
  "currency": "USD",
  "duration_ms": 234,
  "status": "success",
  "tags": ["payment", "subscription"]
}
```

### Alerting

**Critical Alerts** (Page on-call immediately):
- Service down/unhealthy (> 5 minute outage)
- Error rate > 5% for 5 minutes
- Database unavailable
- Payment processing failure (> 10 failures/hour)
- Unauthorized access attempt (> 100 failed logins/hour)

**High Priority** (Alert via Slack/Email):
- Error rate > 1% for 10 minutes
- Response time > 2s (p95) for 10 minutes
- Database replication lag > 10 seconds
- Certificate expiring in < 7 days

**Medium Priority** (Daily summary):
- Warnings: 50+ in last hour
- Memory usage > 80%
- Disk usage > 85%
- Subscription renewal failures (retry later)

### Distributed Tracing

**Trace Propagation**:

```
Client Request
  ↓
ALB assigns X-Amzn-Trace-Id
  ↓
API Gateway → Auth Service (include trace ID)
  ↓
Auth Service → User Service (include trace ID)
  ↓
User Service → Database (query traced)
  ↓
Response flows back with trace ID
  ↓
Logs aggregated by trace ID in X-Ray
```

**Sampling Strategy**:
- ERROR: 100% sampling (all errors traced)
- POST requests: 10% sampling
- GET requests: 1% sampling (high volume)
- Manual override: Can trace specific users in production (with audit logging)

---

## Backup & Disaster Recovery Strategy

### Backup Policy

**Database Backups**:

```
Automated RDS Snapshots:
- Frequency: Daily at 00:00 UTC
- Retention: 35 days
- Type: Full snapshots
- Cross-region: Yes (us-west-2, eu-west-1)
- RPO: 1 day (one day of data loss acceptable)
- RTO: 15 minutes (15 min to restore)

Backup Validation:
- Weekly restore test (to staging environment)
- Integrity check: Verify database consistency
- Performance test: Ensure restored DB meets SLA
- Alert if validation fails
```

**Application & Configuration Backups**:

```
Source Code:
- Git repository: GitHub (multiple remote backups)
- Frequency: On every commit
- Branch protection: Automated testing before merge

Infrastructure as Code:
- Terraform state: S3 (versioned, encrypted)
- Frequency: On every apply
- Backup: Cross-region replication

Container Images:
- Amazon ECR (Elastic Container Registry)
- Retention: Last 10 images per service
- Tagging: git-commit-hash, release-version
```

**Data Backups**:

```
S3 Objects:
- Versioning: Enabled
- Lifecycle: Transition to Glacier after 90 days
- Cross-region replication: Yes
- MFA delete: Enabled on backup bucket

Databases Compliance Backups:
- Format: Encrypted SQL dumps
- Frequency: Weekly
- Retention: 7 years
- Storage: Separate S3 bucket (compliance-backup)
```

### Disaster Recovery Procedures

**RTO/RPO Targets**:

```
Tier 1 (< 1 hour RTO):
- Application services (ECS)
- Cache layer (ElastiCache)
- Message queues (SQS)

Tier 2 (< 4 hours RTO):
- Database (RDS) - standby ready
- Static content (S3)
- CDN cache

Tier 3 (24 hours RTO):
- Archived data
- Historical analytics
- Compliance backups
```

**Failover Procedures**:

**Database Failover** (Multi-AZ):
1. RDS detects primary failure
2. Automatic failover initiated (< 2 min)
3. DNS updated to secondary (automatic)
4. Application reconnects automatically
5. Monitoring alerts: DB failover event

**Regional Failover** (Route 53):
1. Health check detects region outage
2. DNS updated to secondary region (60 sec TTL)
3. Clients redirected to standby region
4. On-call team notified
5. Manual investigation/recovery

**Application Recovery**:
1. Deploy latest container image from ECR
2. Infrastructure provisioned from Terraform
3. Environment variables/secrets from Secrets Manager
4. Database connected via RDS endpoint
5. Health checks verify service readiness

**Communication**:
- Status page: Automatic update via AWS (statuspage.io)
- Slack notifications: Automated alerts
- Email: Scheduled updates (hourly during incident)
- Public communication: Transparency during incident

---

## Audit & Compliance Verification

### Regular Audits

**Quarterly Security Review**:
- Code security scanning (SAST)
- Dependency vulnerability scanning
- Infrastructure review
- Access control audit

**Annual Penetration Testing**:
- External penetration test (approved vendor)
- Red team exercise (internal)
- Vulnerability remediation plan
- Risk assessment updated

**Compliance Certifications**:
- GDPR: Compliance assessment annually
- RF 152-FZ: Compliance assessment annually
- PCI-DSS: Annual validation (via Stripe)
- SOC 2 Type II: Annual audit

---

## Incident Response Plan

**Incident Classification**:

```
P1 (Critical, Page immediately):
- Data breach confirmed
- Service completely down
- Payment processing failure
- Security vulnerability exploited

P2 (High, Notify on-call):
- Service degradation (>50% capacity)
- Data inconsistency detected
- Failed compliance check

P3 (Medium, Next business day):
- Minor bugs
- Performance degradation
- Non-critical security findings
```

**Response Process**:

1. **Detection** → 1 min (automated alerts)
2. **Triage** → 5 min (assess severity, on-call response)
3. **Mitigation** → 15 min (stop bleeding, temporary workaround)
4. **Resolution** → Varies (fix root cause)
5. **Notification** → Ongoing (stakeholders updated)
6. **Post-Mortem** → 24 hours (RCA, prevention)
7. **Documentation** → 48 hours (incident report filed)

---

## Rationale

1. **Multi-layered Security**: Defense in depth approach with multiple layers
2. **Compliance-First**: Proactive compliance reduces legal/regulatory risk
3. **Transparency**: Users informed of data practices and rights
4. **Resilience**: Comprehensive backup/recovery enables rapid restoration
5. **Auditability**: Extensive logging enables investigation and compliance verification

## Consequences

**Positive**:
- High user trust (transparent privacy practices)
- Reduced regulatory risk
- Rapid incident recovery
- Comprehensive visibility into system health

**Negative**:
- Operational complexity
- Additional monitoring/logging overhead
- Compliance training required for team
- Cost of encryption, backups, monitoring services

## Related ADRs

- [ADR 001: Technology Stack](./001-technology-stack.md)
- [ADR 003: Deployment Topology](./003-deployment-topology.md)
