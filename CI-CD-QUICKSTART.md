# CI/CD Quick Start Guide

Get up and running with our CI/CD pipelines in minutes.

## 🚀 Overview

Our monorepo includes 4 automated GitHub Actions workflows:

1. **CI Pipeline** - Runs on every PR (automatic)
2. **Mobile Deployment** - Builds iOS/Android apps with Expo EAS (manual)
3. **Backend Deployment** - Deploys to AWS ECS (manual)
4. **Admin Web Deployment** - Deploys to Vercel or CloudFront (manual)

## ✅ Prerequisites

- [ ] GitHub repository with Actions enabled
- [ ] AWS account (for backend/CloudFront)
- [ ] Expo account (for mobile builds)
- [ ] Vercel account (optional, for frontend)

## 📦 Step 1: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm@8

# Install all workspace dependencies
pnpm install
```

## 🔑 Step 2: Configure Secrets

### Minimum Required Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

#### For All Workflows:
```
AWS_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsRole
AWS_REGION=us-east-1
```

#### For Mobile:
```
EXPO_TOKEN=<Get from: expo login && expo whoami --json>
STAGING_API_URL=https://api-staging.example.com
PRODUCTION_API_URL=https://api.example.com
```

#### For Backend:
```
ECR_REPOSITORY_BACKEND=backend
ECS_CLUSTER=production-cluster
ECS_SERVICE_BACKEND=backend-service
ECS_TASK_DEFINITION_BACKEND=backend-task
SUBNET_ID=subnet-xxxxx
SECURITY_GROUP_ID=sg-xxxxx
API_URL=https://api-staging.example.com
```

#### For Admin Web (Vercel):
```
VERCEL_TOKEN=<From Vercel Settings>
VERCEL_ORG_ID=<From Vercel Project>
VERCEL_PROJECT_ID=<From Vercel Project>
NEXT_PUBLIC_API_URL=https://api-staging.example.com
```

> 📘 **See detailed setup**: `.github/workflows/secrets.example.md`

## 🔐 Step 3: Set Up AWS OIDC (One-time)

### Quick Setup Script

Create `setup-aws-oidc.sh`:

```bash
#!/bin/bash

# Replace with your values
AWS_ACCOUNT_ID="123456789012"
GITHUB_ORG="your-org"
GITHUB_REPO="your-repo"
ROLE_NAME="GitHubActionsRole"

# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

# Create OIDC provider (if not exists)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  2>/dev/null || echo "OIDC provider already exists"

# Create role
aws iam create-role \
  --role-name ${ROLE_NAME} \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Get role ARN
aws iam get-role \
  --role-name ${ROLE_NAME} \
  --query 'Role.Arn' \
  --output text

echo ""
echo "✅ Setup complete!"
echo "Add the role ARN above to GitHub Secrets as AWS_ROLE_ARN"
```

Run it:
```bash
chmod +x setup-aws-oidc.sh
./setup-aws-oidc.sh
```

## 🌍 Step 4: Create GitHub Environments

1. Go to: `Settings → Environments`
2. Click "New environment"
3. Create `staging`
4. Create `production`
5. For production:
   - Add required reviewers
   - Set deployment branch to `main` only

## 🛡️ Step 5: Enable Branch Protection

1. Go to: `Settings → Branches → Add rule`
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass: `CI Status Check`
   - ✅ Require branches to be up to date before merging

## 🧪 Step 6: Test CI Pipeline

```bash
# Create test branch
git checkout -b test/ci-setup

# Make a small change
echo "# CI/CD Setup Complete" >> TEST.md

# Commit and push
git add TEST.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-setup
```

Create a PR and watch CI run! ✨

## 📱 Step 7: Test Mobile Deployment

1. Go to: `Actions → Deploy Mobile - EAS Build`
2. Click "Run workflow"
3. Select:
   - **Platform**: `android`
   - **Profile**: `preview`
   - **Environment**: `staging`
4. Click "Run workflow"
5. Monitor at: https://expo.dev

## 🖥️ Step 8: Test Backend Deployment

1. Go to: `Actions → Deploy Backend to AWS`
2. Click "Run workflow"
3. Select: **Environment**: `staging`
4. Click "Run workflow"
5. Check logs and verify health check

## 🌐 Step 9: Test Admin Web Deployment

1. Go to: `Actions → Deploy Admin Web`
2. Click "Run workflow"
3. Select:
   - **Environment**: `staging`
   - **Target**: `vercel` (or `cloudfront`)
4. Click "Run workflow"
5. Verify deployment URL works

## 🎉 You're Done!

Your CI/CD pipelines are now fully configured!

## 📊 Daily Workflow

### For Developers

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... code ...

# Run checks locally (recommended)
pnpm lint
pnpm typecheck
pnpm test
pnpm build

# Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# Create PR - CI runs automatically
```

### For Deployments

**Staging** (anyone can deploy):
1. Go to Actions
2. Select workflow
3. Run with environment: `staging`

**Production** (requires approval):
1. Go to Actions
2. Select workflow
3. Run with environment: `production`
4. Wait for approval
5. Deployment proceeds

## 🔍 Monitoring

### CI Status
- View in PR checks section
- All checks must pass to merge

### Deployment Status
- Check Actions tab for logs
- Backend: `curl https://api.example.com/api/health`
- Admin Web: Visit deployment URL
- Mobile: Check Expo dashboard

## 🆘 Troubleshooting

### CI Failing?

```bash
# Run locally first
pnpm lint --fix
pnpm format
pnpm test
pnpm build
```

### Deployment Failing?

1. **Check workflow logs** in Actions tab
2. **Verify secrets** are set correctly
3. **Check AWS resources** exist (ECS, ECR, etc.)
4. **Review detailed docs**: `docs/CI-CD.md`

## 📚 Next Steps

- [ ] Review workflow files in `.github/workflows/`
- [ ] Read detailed docs: `docs/CI-CD.md`
- [ ] Configure monitoring and alerts
- [ ] Set up staging environment
- [ ] Plan production deployment
- [ ] Train team on workflows

## 🤔 Need Help?

- **Detailed Documentation**: `docs/CI-CD.md`
- **Secrets Guide**: `.github/workflows/secrets.example.md`
- **Workflow Docs**: `.github/workflows/README.md`
- **Create an Issue**: For questions or problems

## 📝 Cheat Sheet

### Common Commands

```bash
# Run all CI checks locally
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Fix formatting
pnpm format

# Clean and rebuild
pnpm clean && pnpm install && pnpm build

# Run specific workspace tests
pnpm --filter backend test
pnpm --filter @packages/api-client test
```

### Workflow Triggers

| Workflow | Trigger | When |
|----------|---------|------|
| CI | Automatic | Every PR/push |
| Mobile | Manual | `workflow_dispatch` |
| Backend | Manual | `workflow_dispatch` |
| Admin Web | Manual | `workflow_dispatch` |

### Required PR Checks

- ✅ Lint (all workspaces)
- ✅ Typecheck (all workspaces)
- ✅ Unit Tests (backend, packages)
- ✅ Integration Tests (backend)
- ✅ Build (all apps)
- ✅ Format Check (all files)

---

**🎯 Quick Links**:
- [Detailed CI/CD Docs](docs/CI-CD.md)
- [Secrets Configuration](.github/workflows/secrets.example.md)
- [Workflow README](.github/workflows/README.md)
- [Architecture Docs](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

**Happy Deploying!** 🚀
