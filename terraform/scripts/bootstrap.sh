#!/bin/bash

set -e

echo "=========================================="
echo "Terraform Bootstrap Script"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="${PROJECT_NAME:-rayman-portfolio}"
STATE_BUCKET="${STATE_BUCKET:-${PROJECT_NAME}-terraform-state}"
LOCK_TABLE="${LOCK_TABLE:-${PROJECT_NAME}-terraform-locks}"

echo "Configuration:"
echo "  AWS Region:    $AWS_REGION"
echo "  Project Name:  $PROJECT_NAME"
echo "  State Bucket:  $STATE_BUCKET"
echo "  Lock Table:    $LOCK_TABLE"
echo ""

read -p "Continue with this configuration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo "Step 1: Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "ERROR: AWS credentials not configured or invalid."
    echo "Please configure AWS credentials using 'aws configure' or environment variables."
    exit 1
fi
echo "✓ AWS credentials validated"
echo ""

echo "Step 2: Creating S3 bucket for Terraform state..."
if aws s3api head-bucket --bucket "$STATE_BUCKET" 2>/dev/null; then
    echo "✓ S3 bucket '$STATE_BUCKET' already exists"
else
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "$STATE_BUCKET" \
            --region "$AWS_REGION"
    else
        aws s3api create-bucket \
            --bucket "$STATE_BUCKET" \
            --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    
    aws s3api put-bucket-versioning \
        --bucket "$STATE_BUCKET" \
        --versioning-configuration Status=Enabled
    
    aws s3api put-bucket-encryption \
        --bucket "$STATE_BUCKET" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'
    
    aws s3api put-public-access-block \
        --bucket "$STATE_BUCKET" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    echo "✓ S3 bucket '$STATE_BUCKET' created and configured"
fi
echo ""

echo "Step 3: Creating DynamoDB table for state locking..."
if aws dynamodb describe-table --table-name "$LOCK_TABLE" --region "$AWS_REGION" > /dev/null 2>&1; then
    echo "✓ DynamoDB table '$LOCK_TABLE' already exists"
else
    aws dynamodb create-table \
        --table-name "$LOCK_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region "$AWS_REGION" \
        --tags Key=Project,Value="$PROJECT_NAME" Key=ManagedBy,Value=Terraform
    
    echo "Waiting for DynamoDB table to be created..."
    aws dynamodb wait table-exists --table-name "$LOCK_TABLE" --region "$AWS_REGION"
    echo "✓ DynamoDB table '$LOCK_TABLE' created"
fi
echo ""

echo "Step 4: Creating backend configuration file..."
cat > "$PROJECT_ROOT/backend-config.hcl" <<EOF
bucket         = "$STATE_BUCKET"
key            = "terraform.tfstate"
region         = "$AWS_REGION"
encrypt        = true
dynamodb_table = "$LOCK_TABLE"
EOF
echo "✓ Backend configuration file created: backend-config.hcl"
echo ""

echo "=========================================="
echo "Bootstrap Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review and uncomment the backend configuration in backend.tf"
echo "  2. Update the values in backend.tf to match:"
echo "     - bucket: $STATE_BUCKET"
echo "     - dynamodb_table: $LOCK_TABLE"
echo "  3. Initialize Terraform: terraform init -backend-config=backend-config.hcl"
echo "  4. Select workspace: terraform workspace new dev (or staging/prod)"
echo "  5. Plan deployment: terraform plan -var-file=environments/dev.tfvars"
echo "  6. Apply changes: terraform apply -var-file=environments/dev.tfvars"
echo ""
