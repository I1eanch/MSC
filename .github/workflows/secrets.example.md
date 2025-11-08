# GitHub Secrets Configuration Template

This file provides a template for configuring GitHub secrets required by CI/CD workflows.

## 📝 How to Use

1. Go to: `Settings → Secrets and variables → Actions`
2. Click "New repository secret" for each secret below
3. Copy the name exactly as shown
4. Provide the appropriate value for your environment

## 🔑 Required Secrets

### AWS Configuration (Required for backend and CloudFront deployments)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication | `arn:aws:iam::123456789012:role/GitHubActionsRole` |
| `AWS_REGION` | AWS region for deployments | `us-east-1` |

### Mobile Deployment (Expo EAS)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `EXPO_TOKEN` | Expo authentication token | Run: `expo login && expo whoami --json` |
| `STAGING_API_URL` | Backend API URL for staging | `https://api-staging.example.com` |
| `PRODUCTION_API_URL` | Backend API URL for production | `https://api.example.com` |

### Backend Deployment (AWS ECS)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `ECR_REPOSITORY_BACKEND` | ECR repository name | `backend` or `myapp/backend` |
| `ECS_CLUSTER` | ECS cluster name | `production-cluster` |
| `ECS_SERVICE_BACKEND` | ECS service name | `backend-service` |
| `ECS_TASK_DEFINITION_BACKEND` | ECS task definition name | `backend-task` |
| `SUBNET_ID` | VPC subnet ID for tasks | `subnet-12345abcde` |
| `SECURITY_GROUP_ID` | Security group ID | `sg-12345abcde` |
| `API_URL` | Backend API URL for health checks | `https://api-staging.example.com` |

### Admin Web Deployment (Vercel)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel Project Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Project Settings → General |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api-staging.example.com` |

### Admin Web Deployment (AWS CloudFront)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `S3_BUCKET_ADMIN_WEB` | S3 bucket name | `my-admin-web-staging` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | `E1234ABCDEFGH` |
| `CLOUDFRONT_URL` | CloudFront domain | `https://d111111abcdef8.cloudfront.net` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api-staging.example.com` |

## 🌍 Environment-Specific Secrets

For better organization, use GitHub Environments to manage environment-specific secrets.

### Creating Environments

1. Go to: `Settings → Environments`
2. Click "New environment"
3. Create `staging` and `production` environments
4. Add environment-specific secrets to each

### Staging Environment Secrets

```
Environment: staging
├── AWS_ROLE_ARN: arn:aws:iam::123456789012:role/GitHubActionsStaging
├── API_URL: https://api-staging.example.com
├── NEXT_PUBLIC_API_URL: https://api-staging.example.com
├── S3_BUCKET_ADMIN_WEB: admin-web-staging
├── CLOUDFRONT_DISTRIBUTION_ID: E1234STAGING
├── CLOUDFRONT_URL: https://staging.example.com
├── ECS_CLUSTER: staging-cluster
├── ECS_SERVICE_BACKEND: backend-staging
└── ... (other staging-specific values)
```

### Production Environment Secrets

```
Environment: production
├── AWS_ROLE_ARN: arn:aws:iam::123456789012:role/GitHubActionsProduction
├── API_URL: https://api.example.com
├── NEXT_PUBLIC_API_URL: https://api.example.com
├── S3_BUCKET_ADMIN_WEB: admin-web-production
├── CLOUDFRONT_DISTRIBUTION_ID: E5678PRODTN
├── CLOUDFRONT_URL: https://example.com
├── ECS_CLUSTER: production-cluster
├── ECS_SERVICE_BACKEND: backend-production
└── ... (other production-specific values)
```

## 🔐 AWS OIDC Setup

### Step 1: Create OIDC Provider

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Step 2: Create IAM Role

Create a file `trust-policy.json`:

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
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

Replace:
- `ACCOUNT_ID` with your AWS account ID
- `YOUR_ORG/YOUR_REPO` with your GitHub repository

Create the role:

```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json
```

### Step 3: Attach Policies

```bash
# For ECR access
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# For ECS access
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

# For S3 access
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# For CloudFront access
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

### Step 4: Get Role ARN

```bash
aws iam get-role --role-name GitHubActionsRole --query 'Role.Arn' --output text
```

Add this ARN to GitHub Secrets as `AWS_ROLE_ARN`.

## 🎯 Expo EAS Setup

### Step 1: Create Expo Account

1. Visit https://expo.dev
2. Sign up or log in

### Step 2: Get Authentication Token

```bash
# Install Expo CLI
npm install -g expo-cli

# Login
expo login

# Get token
expo whoami --json
```

Copy the `authenticationToken` and add it to GitHub Secrets as `EXPO_TOKEN`.

### Step 3: Configure EAS Build

The workflow automatically creates an `eas.json` configuration, but you can customize it in `apps/mobile/eas.json`.

## 🌐 Vercel Setup

### Step 1: Create Vercel Account

1. Visit https://vercel.com
2. Sign up or log in
3. Import your repository

### Step 2: Get Vercel Token

1. Go to: Account Settings → Tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token
5. Add to GitHub Secrets as `VERCEL_TOKEN`

### Step 3: Get Project IDs

1. Go to your project settings
2. Copy "Project ID" → Add as `VERCEL_PROJECT_ID`
3. Copy "Organization ID" → Add as `VERCEL_ORG_ID`

Or use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd apps/admin-web
vercel link

# Get IDs
cat .vercel/project.json
```

## 🔍 Verification Checklist

After setting up secrets, verify:

- [ ] All required secrets are added
- [ ] Secret names match exactly (case-sensitive)
- [ ] AWS OIDC provider is created
- [ ] IAM role has correct trust policy
- [ ] IAM role has necessary permissions
- [ ] Expo account is configured
- [ ] Vercel project is linked (if using Vercel)
- [ ] Environment-specific secrets are in correct environments
- [ ] Test workflow runs successfully

## 🧪 Testing Secrets

To test if secrets are configured correctly:

1. Create a test branch
2. Trigger a workflow run
3. Check workflow logs for authentication errors
4. Verify deployments succeed

## 🚨 Security Best Practices

- ✅ Use environment-specific secrets
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use AWS OIDC instead of access keys
- ✅ Limit IAM role permissions to minimum required
- ✅ Enable branch protection rules
- ✅ Require approval for production deployments
- ❌ Never commit secrets to the repository
- ❌ Never share secrets in public channels
- ❌ Never use production secrets in staging

## 📞 Troubleshooting

### Common Issues

1. **AWS Authentication Failed**
   - Verify OIDC provider exists
   - Check trust policy includes correct repository
   - Verify IAM role ARN is correct

2. **Expo Build Failed**
   - Verify `EXPO_TOKEN` is valid
   - Check Expo account has sufficient quota
   - Ensure `app.json` configuration is valid

3. **Vercel Deployment Failed**
   - Verify Vercel token is valid
   - Check project IDs are correct
   - Ensure project is linked to repository

4. **ECS Deployment Failed**
   - Verify task definition exists
   - Check ECS service is running
   - Ensure security groups allow traffic
   - Verify subnet has internet access

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Expo EAS Documentation](https://docs.expo.dev/build/introduction/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
