# Deployment Guide

Production deployment strategies and instructions for each application.

## 🎯 Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass: `pnpm test`
- [ ] Code lints without errors: `pnpm lint`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] Environment variables configured
- [ ] Database migrations prepared
- [ ] Security audit passed: `npm audit`
- [ ] Documentation updated

---

## 🔌 Backend Deployment (NestJS)

### Build

```bash
# Build production-ready application
pnpm --filter backend build

# Output: apps/backend/dist/
```

### Environment Setup

Create production `.env` file:

```env
NODE_ENV=production
PORT=3000
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USERNAME=produser
DB_PASSWORD=<secure-password>
DB_NAME=monorepo_prod
JWT_SECRET=<secure-random-secret>
LOG_LEVEL=info
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --prod

# Build
RUN pnpm --filter backend build

EXPOSE 3000

CMD ["node", "apps/backend/dist/main.js"]
```

#### Build & Run

```bash
# Build image
docker build -f apps/backend/Dockerfile -t monorepo-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=password \
  -e DB_NAME=monorepo_prod \
  --network app-network \
  monorepo-backend:latest
```

#### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: monorepo_prod
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_NAME: monorepo_prod
    depends_on:
      - postgres
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

### Cloud Deployment

#### AWS Lambda

```bash
# Install serverless
npm install -g serverless

# Initialize
serverless create --template aws-nodejs-typescript

# Deploy
serverless deploy
```

#### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag monorepo-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/monorepo-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/monorepo-backend:latest

# Deploy via ECS
aws ecs update-service --cluster monorepo --service backend --force-new-deployment
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/<project>/monorepo-backend

# Deploy
gcloud run deploy monorepo-backend \
  --image gcr.io/<project>/monorepo-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production
```

#### Heroku

```bash
# Login
heroku login

# Create app
heroku create monorepo-backend

# Set environment
heroku config:set NODE_ENV=production -a monorepo-backend

# Deploy
git push heroku main
```

### Database Migrations

Run migrations before starting application:

```bash
# Development
pnpm --filter backend db:migrate

# Production
NODE_ENV=production pnpm --filter backend db:migrate
```

Or in Docker:

```dockerfile
RUN npm install -g pnpm && \
    pnpm install && \
    pnpm --filter backend db:migrate
```

### Health Checks

Test deployment:

```bash
curl http://localhost:3000/api/health
# Response: {"status":"Backend API is healthy"}
```

---

## 🌐 Admin Web Deployment (Next.js)

### Build

```bash
# Build static/serverless version
pnpm --filter admin-web build

# Output: apps/admin-web/.next/
```

### Environment Setup

Create production `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### Vercel Deployment (Recommended)

Vercel is optimized for Next.js:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/admin-web
vercel --prod
```

Or connect GitHub:

1. Go to https://vercel.com
2. Import repository
3. Configure environment variables
4. Deploy

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/admin-web/ ./apps/admin-web/
COPY packages/ ./packages/

RUN npm install -g pnpm
RUN pnpm install

RUN pnpm --filter admin-web build

FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin-web/.next ./apps/admin-web/.next
COPY --from=builder /app/apps/admin-web/public ./apps/admin-web/public
COPY apps/admin-web/package.json ./apps/admin-web/

EXPOSE 3000

CMD ["pnpm", "--filter", "admin-web", "start"]
```

#### Build & Run

```bash
docker build -f apps/admin-web/Dockerfile -t monorepo-admin-web:latest .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  monorepo-admin-web:latest
```

### Static Export

For static hosting (AWS S3, Netlify, etc.):

1. Modify `next.config.js`:

```javascript
module.exports = {
  output: 'export',
  // ...
};
```

2. Build:

```bash
pnpm --filter admin-web build
```

3. Deploy `apps/admin-web/out/` to CDN

### AWS Amplify

```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Configure
amplify init

# Deploy
amplify publish
```

### Netlify

1. Connect GitHub repository
2. Configure build settings:
   - Build command: `pnpm --filter admin-web build`
   - Publish directory: `apps/admin-web/.next`
3. Deploy

---

## 📱 Mobile Deployment

### iOS (App Store)

```bash
# Build for release
pnpm --filter mobile build:ios

# Steps:
# 1. Archive in Xcode
# 2. Validate
# 3. Submit to App Store Connect
# 4. Wait for review
```

### Android (Google Play)

```bash
# Build for release
pnpm --filter mobile build:android

# Output: apps/mobile/android/app/build/outputs/apk/release/

# Create Google Play signed key
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Upload to Google Play Console
```

### Firebase App Distribution

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy iOS build
firebase app-distribution:ios:upload apps/mobile/dist/App.ipa \
  --app=com.example.monorepo.ios

# Deploy Android build
firebase app-distribution:android:upload apps/mobile/android/app/build/outputs/apk/release/app-release.apk \
  --app=com.example.monorepo.android
```

---

## 📦 Shared Package Publishing

### Publishing to npm

1. Update version:

```json
{
  "version": "1.0.1"
}
```

2. Remove private flag:

```json
{
  "private": false
}
```

3. Build:

```bash
pnpm --filter @packages/api-client build
```

4. Publish:

```bash
cd packages/api-client
npm publish
```

Or use npm organization:

```bash
npm publish --@myorg:registry https://registry.npmjs.org/
```

---

## 🔐 Security Considerations

### Environment Variables

- Never commit `.env` files with secrets
- Use secrets management (AWS Secrets Manager, Google Secret Manager)
- Rotate secrets regularly
- Use different secrets per environment

### Dependencies

```bash
# Audit for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Or manual review
npm audit
```

### CORS & Security Headers

Backend should configure:

```typescript
// apps/backend/src/app.module.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});

// Add security headers middleware
```

### HTTPS

Always use HTTPS in production:

```bash
# Let's Encrypt free certificates
# Or use managed certificates from cloud provider
```

---

## 📊 Monitoring & Logging

### Backend Monitoring

```typescript
// Add logging
import * as winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Admin Web Monitoring

Integrate error tracking:

```typescript
// pages/_app.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

- Sentry: Error tracking
- DataDog: Infrastructure monitoring
- New Relic: APM
- CloudWatch: AWS monitoring

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      
      - name: Deploy Backend
        run: docker push myregistry/backend:latest
      
      - name: Deploy Admin Web
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 🚨 Rollback Strategy

### Backend Rollback

```bash
# With Docker
docker run -d -p 3000:3000 myregistry/backend:previous

# With Kubernetes
kubectl set image deployment/backend backend=myregistry/backend:previous
```

### Admin Web Rollback

```bash
# With Vercel
vercel rollback

# With GitHub
git revert <commit-hash>
git push
```

---

## 📋 Deployment Checklist

- [ ] Build succeeds locally
- [ ] All tests pass
- [ ] Environment variables set correctly
- [ ] Database migrations prepared
- [ ] Health checks configured
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API documentation updated

