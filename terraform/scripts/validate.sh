#!/bin/bash

set -e

echo "=========================================="
echo "Terraform Validation Script"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "Step 1: Checking Terraform installation..."
if ! command -v terraform &> /dev/null; then
    echo "ERROR: Terraform is not installed."
    echo "Please install Terraform: https://www.terraform.io/downloads"
    exit 1
fi
TERRAFORM_VERSION=$(terraform version -json | grep -o '"terraform_version":"[^"]*"' | cut -d'"' -f4)
echo "✓ Terraform version: $TERRAFORM_VERSION"
echo ""

echo "Step 2: Formatting Terraform files..."
terraform fmt -recursive
echo "✓ Terraform files formatted"
echo ""

echo "Step 3: Initializing Terraform (without backend)..."
terraform init -backend=false
echo "✓ Terraform initialized"
echo ""

echo "Step 4: Validating Terraform configuration..."
terraform validate
echo "✓ Terraform configuration is valid"
echo ""

echo "Step 5: Running security checks with tfsec (if available)..."
if command -v tfsec &> /dev/null; then
    tfsec . --soft-fail
    echo "✓ Security checks completed"
else
    echo "⚠ tfsec not installed - skipping security checks"
    echo "  Install with: brew install tfsec (macOS) or see https://github.com/aquasecurity/tfsec"
fi
echo ""

echo "=========================================="
echo "Validation Complete!"
echo "=========================================="
echo ""
