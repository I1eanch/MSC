# GitHub Actions CI/CD Pipelines

This directory contains GitHub Actions workflows for automated CI/CD pipelines supporting our monorepo structure.

## 📋 Overview

Our CI/CD setup includes:

- **Continuous Integration (CI)**: Automated testing, linting, and building on every PR
- **Mobile Deployment**: Expo EAS builds for iOS and Android
- **Backend Deployment**: Docker-based deployment to AWS ECS using OIDC
- **Admin Web Deployment**: Deployment to Vercel or AWS CloudFront

## 🔄 Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

**Jobs:**
- `setup`: Installs dependencies and sets up caching
- `lint`: Lints all workspaces in parallel
- `typecheck`: Type checks all TypeScript workspaces
- `test-unit`: Runs unit tests for backend and packages
- `test-integration`: Runs integration tests with PostgreSQL database
- `build`: Builds all applications
- `format-check`: Validates code formatting
- `status-check`: Aggregates results and gates PR merges

**Status**: Required for PR merge

### 2. Mobile Deployment (`deploy-mobile.yml`)

**Triggers:**
- Manual workflow dispatch

**Parameters:**
- `platform`: ios | android | all
- `profile`: development | preview | production
- `environment`: staging | production

**Features:**
- Builds mobile apps using Expo EAS
- Supports internal distribution for testing
- Generates preview builds for staging
- Production builds for app stores

**Required Secrets:**
- `EXPO_TOKEN`: Expo authentication token
- `STAGING_API_URL`: Staging backend API URL
- `PRODUCTION_API_URL`: Production backend API URL

### 3. Backend Deployment (`deploy-backend.yml`)

**Triggers:**
- Manual workflow dispatch

**Parameters:**
- `environment`: staging | production

**Features:**
- Builds Docker image with multi-stage build
- Pushes to Amazon ECR
- Deploys to AWS ECS using Fargate
- Runs database migrations
- Performs health checks
- Uses AWS OIDC for secure authentication (no long-lived credentials)

**Required Secrets:**
- `AWS_ROLE_ARN`: IAM role ARN for OIDC authentication
- `AWS_REGION`: AWS region (default: us-east-1)
- `ECR_REPOSITORY_BACKEND`: ECR repository name
- `ECS_CLUSTER`: ECS cluster name
- `ECS_SERVICE_BACKEND`: ECS service name
- `ECS_TASK_DEFINITION_BACKEND`: Task definition name
- `SUBNET_ID`: VPC subnet for tasks
- `SECURITY_GROUP_ID`: Security group for tasks
- `API_URL`: Backend API URL for health checks

### 4. Admin Web Deployment (`deploy-admin-web.yml`)

**Triggers:**
- Manual workflow dispatch

**Parameters:**
- `environment`: staging | production
- `target`: vercel | cloudfront

**Features:**
- Builds Next.js application
- Deploys to Vercel (serverless) or AWS CloudFront (static)
- Supports static export for CloudFront
- Invalidates CloudFront cache
- Uses AWS OIDC for CloudFront deployments

**Required Secrets for Vercel:**
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `NEXT_PUBLIC_API_URL`: Backend API URL

**Required Secrets for CloudFront:**
- `AWS_ROLE_ARN`: IAM role ARN for OIDC authentication
- `AWS_REGION`: AWS region
- `S3_BUCKET_ADMIN_WEB`: S3 bucket for static files
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID
- `CLOUDFRONT_URL`: CloudFront URL for verification
- `NEXT_PUBLIC_API_URL`: Backend API URL

## 🔐 AWS OIDC Setup

Our workflows use GitHub OIDC to authenticate with AWS, eliminating the need for long-lived access keys.

### Prerequisites

1. **Create IAM OIDC Identity Provider** in AWS:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. **Create IAM Role** with trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"
        }
      }
    }
  ]
}
```

3. **Attach Policies** to the role:
   - `AmazonEC2ContainerRegistryPowerUser` (for ECR)
   - `AmazonECS_FullAccess` (for ECS)
   - `AmazonS3FullAccess` or custom S3 policy
   - `CloudFrontFullAccess` or custom CloudFront policy

### Configuration

Add the role ARN to GitHub Secrets:
- `AWS_ROLE_ARN`: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole`

## 🔑 Secrets Configuration

### GitHub Repository Secrets

Navigate to: `Settings → Secrets and variables → Actions`

#### For All Workflows:
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `AWS_ROLE_ARN`: IAM role for OIDC authentication

#### For Mobile Deployment:
- `EXPO_TOKEN`: Get from `expo login && expo whoami --json`
- `STAGING_API_URL`: Staging backend URL
- `PRODUCTION_API_URL`: Production backend URL

#### For Backend Deployment:
- `ECR_REPOSITORY_BACKEND`: ECR repository name (e.g., `backend`)
- `ECS_CLUSTER`: ECS cluster name (e.g., `production-cluster`)
- `ECS_SERVICE_BACKEND`: ECS service name (e.g., `backend-service`)
- `ECS_TASK_DEFINITION_BACKEND`: Task definition (e.g., `backend-task`)
- `SUBNET_ID`: VPC subnet ID
- `SECURITY_GROUP_ID`: Security group ID
- `API_URL`: Backend API URL

#### For Admin Web (Vercel):
- `VERCEL_TOKEN`: From Vercel account settings
- `VERCEL_ORG_ID`: From Vercel project settings
- `VERCEL_PROJECT_ID`: From Vercel project settings
- `NEXT_PUBLIC_API_URL`: Backend API URL

#### For Admin Web (CloudFront):
- `S3_BUCKET_ADMIN_WEB`: S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID
- `CLOUDFRONT_URL`: CloudFront URL
- `NEXT_PUBLIC_API_URL`: Backend API URL

### GitHub Environments

Create environments for secret management:

1. Navigate to: `Settings → Environments`
2. Create environments: `staging` and `production`
3. Configure environment-specific secrets
4. Optional: Add required reviewers for production

## 🚀 Usage

### Running CI Checks

CI runs automatically on every PR. To ensure your PR passes:

```bash
# Run checks locally before pushing
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

### Deploying Mobile App

1. Go to: `Actions → Deploy Mobile - EAS Build`
2. Click "Run workflow"
3. Select:
   - Platform (ios/android/all)
   - Profile (development/preview/production)
   - Environment (staging/production)
4. Click "Run workflow"
5. Monitor build at: https://expo.dev

### Deploying Backend

1. Go to: `Actions → Deploy Backend to AWS`
2. Click "Run workflow"
3. Select environment (staging/production)
4. Click "Run workflow"
5. Monitor deployment in AWS ECS console

### Deploying Admin Web

1. Go to: `Actions → Deploy Admin Web`
2. Click "Run workflow"
3. Select:
   - Environment (staging/production)
   - Target (vercel/cloudfront)
4. Click "Run workflow"
5. Check deployment:
   - Vercel: Visit Vercel dashboard
   - CloudFront: Visit CloudFront URL

## 📊 Monitoring

### CI Status

- PR checks show status in the PR conversation
- All checks must pass before merge
- View detailed logs in the Actions tab

### Deployment Status

- Workflow run logs show detailed progress
- Deployment summaries appear in the workflow summary
- Health checks verify successful deployment

### Notifications

- PR comments notify about deployments
- Workflow status appears in commit status checks
- GitHub notifications for workflow failures

## 🔧 Maintenance

### Updating Dependencies

```bash
# Update GitHub Actions
# Edit workflow files and bump action versions

# Example:
# actions/checkout@v3 → actions/checkout@v4
```

### Modifying Workflows

1. Edit workflow files in `.github/workflows/`
2. Test on a feature branch
3. Create PR and verify CI passes
4. Merge to main

### Debugging Failed Workflows

1. Click on failed workflow run
2. Expand failed step
3. Review logs
4. Check secrets configuration
5. Verify AWS permissions (for deployment workflows)

## 🎯 Best Practices

### For Developers

- Run `pnpm format` before committing
- Ensure all tests pass locally
- Keep commits small and focused
- Write meaningful commit messages

### For Deployments

- Always deploy to staging first
- Test thoroughly before production
- Review deployment logs
- Verify health checks pass
- Monitor application metrics post-deployment

### For Security

- Rotate secrets regularly
- Use environment-specific secrets
- Limit IAM role permissions
- Review workflow permissions
- Enable branch protection rules

## 🛡️ Security Considerations

### Branch Protection

Configure branch protection rules for `main`:

1. Go to: `Settings → Branches → Branch protection rules`
2. Add rule for `main` branch
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass (CI Pipeline)
   - ✅ Require branches to be up to date
   - ✅ Include administrators
   - ✅ Restrict who can push

### Secrets Management

- Never commit secrets to the repository
- Use GitHub Environments for environment-specific secrets
- Rotate secrets regularly
- Use AWS OIDC instead of access keys
- Limit secret access to necessary workflows

### Workflow Permissions

- Use `permissions` block to limit token scope
- Request minimum required permissions
- Use `id-token: write` only for OIDC workflows
- Review third-party actions before use

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [AWS OIDC for GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Turborepo with GitHub Actions](https://turbo.build/repo/docs/ci/github-actions)

## 🤝 Contributing

When adding or modifying workflows:

1. Test thoroughly on a feature branch
2. Document new secrets or configuration
3. Update this README
4. Request review from team leads
5. Monitor first production run closely

## 📞 Support

For issues or questions:

- Create an issue in the repository
- Contact the DevOps team
- Check workflow logs for error messages
- Review AWS CloudWatch logs for deployment issues
