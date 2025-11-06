# Deployment Guide

This guide covers deploying the Video Infrastructure Service to production.

## Table of Contents

1. [AWS Infrastructure Setup](#aws-infrastructure-setup)
2. [Server Deployment](#server-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Security Hardening](#security-hardening)
5. [Monitoring and Logging](#monitoring-and-logging)
6. [Backup and Recovery](#backup-and-recovery)

---

## AWS Infrastructure Setup

### 1. S3 Buckets

Create two S3 buckets with appropriate configurations:

#### Upload Bucket
```bash
aws s3api create-bucket \
  --bucket your-video-uploads \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket your-video-uploads \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-lifecycle-configuration \
  --bucket your-video-uploads \
  --lifecycle-configuration file://s3-upload-lifecycle.json
```

**s3-upload-lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldUploads",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "uploads/"
      },
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
```

#### Output Bucket
```bash
aws s3api create-bucket \
  --bucket your-video-outputs \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket your-video-outputs \
  --versioning-configuration Status=Enabled
```

#### CORS Configuration
```bash
aws s3api put-bucket-cors \
  --bucket your-video-uploads \
  --cors-configuration file://cors-config.json
```

**cors-config.json:**
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedOrigins": ["https://yourdomain.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

### 2. IAM Roles and Policies

#### MediaConvert Service Role
```bash
aws iam create-role \
  --role-name MediaConvertRole \
  --assume-role-policy-document file://mediaconvert-trust-policy.json

aws iam put-role-policy \
  --role-name MediaConvertRole \
  --policy-name MediaConvertS3Access \
  --policy-document file://mediaconvert-policy.json
```

**mediaconvert-trust-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "mediaconvert.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**mediaconvert-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-video-uploads/*",
        "arn:aws:s3:::your-video-outputs/*"
      ]
    }
  ]
}
```

#### Application Service Role
```bash
aws iam create-user --user-name video-service-user

aws iam put-user-policy \
  --user-name video-service-user \
  --policy-name VideoServicePolicy \
  --policy-document file://app-policy.json

aws iam create-access-key --user-name video-service-user
```

**app-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-video-uploads/*",
        "arn:aws:s3:::your-video-outputs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "mediaconvert:CreateJob",
        "mediaconvert:GetJob",
        "mediaconvert:ListJobs"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. CloudFront Distribution

Create a CloudFront distribution for CDN delivery:

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json:**
```json
{
  "CallerReference": "video-distribution-2024",
  "Comment": "Video CDN Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-video-outputs",
        "DomainName": "your-video-outputs.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/EXAMPLE"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-video-outputs",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "TrustedSigners": {
      "Enabled": true,
      "Quantity": 1,
      "Items": ["self"]
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  }
}
```

#### Create CloudFront Key Pair
```bash
# Generate via AWS Console (Account > Security Credentials > CloudFront key pairs)
# Download the private key and save securely
```

### 4. MediaConvert Setup

Get your MediaConvert endpoint:
```bash
aws mediaconvert describe-endpoints --region us-east-1
```

---

## Server Deployment

### Option 1: EC2 Deployment

#### Launch EC2 Instance
```bash
# Launch Ubuntu 22.04 LTS instance
# Instance type: t3.medium or larger
# Security group: Allow ports 80, 443, 22

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Setup Script
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create application directory
sudo mkdir -p /opt/video-service
sudo chown ubuntu:ubuntu /opt/video-service

# Clone repository
cd /opt/video-service
git clone <your-repo-url> .

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Create required directories
mkdir -p logs data keys

# Copy CloudFront private key
scp cloudfront-private-key.pem ubuntu@your-ec2-ip:/opt/video-service/keys/

# Setup PM2
pm2 start server.js --name video-service
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/video-service
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 5G;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/video-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN mkdir -p logs data keys

EXPOSE 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  video-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./keys:/app/keys:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Deploy with Docker
```bash
docker-compose up -d
docker-compose logs -f video-service
```

### Option 3: AWS ECS/Fargate

Create an ECS task definition and deploy to Fargate for serverless container deployment.

---

## Environment Configuration

### Production .env

```env
NODE_ENV=production
PORT=3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# S3 Configuration
S3_BUCKET_NAME=your-video-uploads
S3_OUTPUT_BUCKET_NAME=your-video-outputs

# MediaConvert Configuration
MEDIACONVERT_ENDPOINT=https://abcdefgh.mediaconvert.us-east-1.amazonaws.com
MEDIACONVERT_ROLE_ARN=arn:aws:iam::123456789:role/MediaConvertRole
MEDIACONVERT_QUEUE_ARN=arn:aws:mediaconvert:us-east-1:123456789:queues/Default

# CloudFront Configuration
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=APKAXXXXXXXX
CLOUDFRONT_PRIVATE_KEY_PATH=/opt/video-service/keys/cloudfront-private-key.pem

# JWT Configuration
JWT_SECRET=<generate-strong-random-secret>
JWT_EXPIRY=24h

# Security
SIGNED_URL_EXPIRY=3600

# Database
DATABASE_PATH=/opt/video-service/data/videos.db

# Logging
LOG_LEVEL=info
```

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Security Hardening

### 1. Firewall Configuration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSH Hardening
```bash
sudo nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 3. SSL/TLS Configuration
Always use HTTPS in production. Configure strong cipher suites in Nginx:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

### 4. Rate Limiting
Add rate limiting to Nginx:

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            # ... proxy configuration
        }
    }
}
```

### 5. Environment Variables Security
- Never commit .env to version control
- Use AWS Secrets Manager or Systems Manager Parameter Store for sensitive data
- Restrict file permissions: `chmod 600 .env`

---

## Monitoring and Logging

### 1. Application Logs
```bash
# View PM2 logs
pm2 logs video-service

# View log files
tail -f /opt/video-service/logs/combined.log
tail -f /opt/video-service/logs/error.log
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resources
htop
```

### 3. CloudWatch Integration
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure and start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
```

### 4. Log Rotation
```bash
sudo nano /etc/logrotate.d/video-service
```

```
/opt/video-service/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup script
cat > /opt/video-service/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/video-service/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 /opt/video-service/data/videos.db ".backup '$BACKUP_DIR/videos_$DATE.db'"
# Keep only last 30 days
find $BACKUP_DIR -name "videos_*.db" -mtime +30 -delete
# Upload to S3
aws s3 cp $BACKUP_DIR/videos_$DATE.db s3://your-backup-bucket/database/
EOF

chmod +x /opt/video-service/scripts/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/video-service/scripts/backup-db.sh
```

### 2. S3 Cross-Region Replication
```bash
aws s3api put-bucket-replication \
  --bucket your-video-outputs \
  --replication-configuration file://replication-config.json
```

### 3. Disaster Recovery Plan
1. Document all infrastructure in code (Infrastructure as Code)
2. Regular backup testing
3. Maintain runbooks for common issues
4. Automated health checks and alerts

---

## Scaling Considerations

### Horizontal Scaling
- Use Application Load Balancer
- Deploy multiple EC2 instances
- Share session state via Redis or database
- Use RDS instead of SQLite for production

### Auto-scaling
```bash
# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name video-service-asg \
  --launch-configuration-name video-service-lc \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns <alb-target-group-arn>
```

---

## Health Checks

### Application Health
```bash
curl http://localhost:3000/health
```

### Automated Monitoring
```bash
# Setup external monitoring (e.g., UptimeRobot, Pingdom)
# Configure alerts for downtime
```

---

## Troubleshooting

### Check Service Status
```bash
pm2 status
pm2 logs video-service --lines 100
```

### Check Disk Space
```bash
df -h
du -sh /opt/video-service/data
```

### Check Network
```bash
netstat -tulpn | grep 3000
```

### Database Issues
```bash
sqlite3 /opt/video-service/data/videos.db "PRAGMA integrity_check;"
```

---

## Maintenance

### Update Application
```bash
cd /opt/video-service
git pull origin main
npm install --production
pm2 restart video-service
```

### Security Updates
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot  # if kernel updated
```

---

## Support Contacts

- Infrastructure: ops@example.com
- Application: dev@example.com
- Emergency: on-call@example.com
