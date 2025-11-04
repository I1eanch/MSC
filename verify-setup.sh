#!/bin/bash

# Monorepo Setup Verification Script
# This script verifies the monorepo structure and dependencies

set -e

echo "🔍 Monorepo Setup Verification"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "1️⃣  Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check pnpm
echo ""
echo "2️⃣  Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm: $PNPM_VERSION"
else
    echo -e "${YELLOW}⚠${NC} pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check directory structure
echo ""
echo "3️⃣  Checking directory structure..."
DIRS=(
    "apps/backend"
    "apps/admin-web"
    "apps/mobile"
    "packages/api-client"
    "packages/ui-kit"
    "packages/analytics-sdk"
    "docs"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir not found"
        exit 1
    fi
done

# Check configuration files
echo ""
echo "4️⃣  Checking configuration files..."
CONFIG_FILES=(
    "package.json"
    "pnpm-workspace.yaml"
    "turbo.json"
    "tsconfig.json"
    ".eslintrc.json"
    ".prettierrc"
    ".gitignore"
    "CONTRIBUTING.md"
    "README.md"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file not found"
        exit 1
    fi
done

# Check documentation files
echo ""
echo "5️⃣  Checking documentation..."
DOC_FILES=(
    "docs/README.md"
    "docs/ARCHITECTURE.md"
    "docs/SETUP.md"
    "docs/WORKSPACES.md"
    "docs/SHARED-PACKAGES.md"
    "docs/SCRIPTS.md"
    "docs/DEPLOYMENT.md"
    "docs/TROUBLESHOOTING.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

# Validate JSON files
echo ""
echo "6️⃣  Validating JSON configuration..."
JSON_FILES=(
    "package.json"
    "turbo.json"
    ".eslintrc.json"
    ".prettierrc"
    "apps/backend/package.json"
    "apps/admin-web/package.json"
    "apps/mobile/package.json"
    "packages/api-client/package.json"
    "packages/ui-kit/package.json"
    "packages/analytics-sdk/package.json"
)

for file in "${JSON_FILES[@]}"; do
    if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (invalid JSON)"
    fi
done

# Summary
echo ""
echo "================================"
echo -e "${GREEN}✓ Setup verification complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'pnpm install' to install dependencies"
echo "   2. Run 'pnpm build' to build all packages"
echo "   3. Run 'pnpm dev' to start development"
echo ""
echo "📖 For more information, see:"
echo "   - README.md"
echo "   - CONTRIBUTING.md"
echo "   - docs/SETUP.md"
echo ""
