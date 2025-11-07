# Available Scripts & Commands

Complete reference for all available npm/pnpm scripts in the monorepo.

## 🚀 Quick Commands

### Installation

```bash
# Install all dependencies
pnpm install

# Install and verify setup
pnpm install && pnpm build
```

### Development

```bash
# Start all applications in development mode
pnpm dev

# Start specific application
pnpm --filter backend dev
pnpm --filter admin-web dev
pnpm --filter mobile start

# Watch for changes in specific workspace
pnpm --filter @packages/api-client build --watch
```

### Building

```bash
# Build all workspaces
pnpm build

# Build specific workspace
pnpm --filter backend build
pnpm --filter admin-web build

# Build with no cache
pnpm build --no-cache
```

### Testing

```bash
# Test all workspaces
pnpm test

# Test specific workspace
pnpm --filter backend test
pnpm --filter backend test:watch
pnpm --filter backend test:cov

# Test mobile
pnpm --filter mobile test
```

### Code Quality

```bash
# Lint all workspaces
pnpm lint

# Lint specific workspace
pnpm --filter backend lint

# Format all code
pnpm format

# Check formatting without changes
pnpm format:check

# Type check all workspaces
pnpm typecheck
```

### Cleanup

```bash
# Remove all build artifacts and node_modules
pnpm clean

# Remove node_modules only
rm -rf node_modules

# Clear pnpm cache
pnpm store prune
```

---

## 📂 Root Level Scripts

From `package.json` in repository root.

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "format:check": "turbo run format:check",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "install-dependencies": "pnpm install"
  }
}
```

### Usage

```bash
# Run development servers
pnpm dev

# Build production
pnpm build

# Run all tests
pnpm test

# Check code quality
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm typecheck

# Clean everything
pnpm clean
```

---

## 🔌 Backend Scripts

From `apps/backend/package.json`.

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "format:check": "prettier --check src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "db:migrate": "typeorm migration:run -d dist/database/data-source.js",
    "db:migrate:revert": "typeorm migration:revert -d dist/database/data-source.js",
    "db:migrate:generate": "typeorm migration:generate -d dist/database/data-source.js",
    "clean": "rm -rf dist"
  }
}
```

### Development

```bash
# Start development server with hot reload
pnpm --filter backend dev

# Access on http://localhost:3000
```

### Building

```bash
# Build TypeScript
pnpm --filter backend build

# Start built application
pnpm --filter backend start
```

### Testing

```bash
# Run tests once
pnpm --filter backend test

# Watch mode - reruns on file changes
pnpm --filter backend test:watch

# Generate coverage report
pnpm --filter backend test:cov
```

### Code Quality

```bash
# Check linting
pnpm --filter backend lint

# Format code with Prettier
pnpm --filter backend format

# Check formatting without changes
pnpm --filter backend format:check

# Type check without compilation
pnpm --filter backend typecheck
```

### Database Management

```bash
# Run pending migrations
pnpm --filter backend db:migrate

# Revert last migration
pnpm --filter backend db:migrate:revert

# Generate migration from entity changes
pnpm --filter backend db:migrate:generate

# Create empty migration
pnpm --filter backend db:migrate:generate -- CreateUserTable
```

### Cleanup

```bash
# Remove build artifacts
pnpm --filter backend clean
```

---

## 🌐 Admin Web Scripts

From `apps/admin-web/package.json`.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write pages/**/*.tsx components/**/*.tsx ...",
    "format:check": "prettier --check pages/**/*.tsx ...",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next dist"
  }
}
```

### Development

```bash
# Start development server with hot reload
pnpm --filter admin-web dev

# Access on http://localhost:3000
```

### Building

```bash
# Build for production
pnpm --filter admin-web build

# Start production server
pnpm --filter admin-web start
```

### Code Quality

```bash
# Run Next.js linting (includes ESLint)
pnpm --filter admin-web lint

# Format code
pnpm --filter admin-web format

# Check formatting
pnpm --filter admin-web format:check

# Type check
pnpm --filter admin-web typecheck
```

### Cleanup

```bash
# Remove .next and dist directories
pnpm --filter admin-web clean
```

---

## 📱 Mobile Scripts

From `apps/mobile/package.json`.

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "build:android": "cd android && ./gradlew assembleRelease && cd ..",
    "build:ios": "cd ios && xcodebuild -workspace App.xcworkspace ...",
    "lint": "eslint src/**/*.{ts,tsx}",
    "format": "prettier --write src/**/*.{ts,tsx}",
    "format:check": "prettier --check src/**/*.{ts,tsx}",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf build dist node_modules && npm install"
  }
}
```

### Development

```bash
# Start Metro bundler (required for iOS/Android)
pnpm --filter mobile start

# In another terminal, run on iOS
pnpm --filter mobile ios

# Or run on Android
pnpm --filter mobile android
```

### Building

```bash
# Build for iOS release
pnpm --filter mobile build:ios

# Build for Android release
pnpm --filter mobile build:android
```

### Code Quality

```bash
# Lint code
pnpm --filter mobile lint

# Format code
pnpm --filter mobile format

# Check formatting
pnpm --filter mobile format:check

# Type check
pnpm --filter mobile typecheck
```

### Cleanup

```bash
# Clean and reinstall
pnpm --filter mobile clean
```

---

## 📦 Shared Package Scripts

All shared packages follow similar patterns.

### @packages/api-client

```bash
pnpm --filter @packages/api-client build
pnpm --filter @packages/api-client typecheck
pnpm --filter @packages/api-client lint
pnpm --filter @packages/api-client format
pnpm --filter @packages/api-client clean
```

### @packages/ui-kit

```bash
pnpm --filter @packages/ui-kit build
pnpm --filter @packages/ui-kit typecheck
pnpm --filter @packages/ui-kit lint
pnpm --filter @packages/ui-kit format
pnpm --filter @packages/ui-kit clean
```

### @packages/analytics-sdk

```bash
pnpm --filter @packages/analytics-sdk build
pnpm --filter @packages/analytics-sdk typecheck
pnpm --filter @packages/analytics-sdk lint
pnpm --filter @packages/analytics-sdk format
pnpm --filter @packages/analytics-sdk clean
```

---

## 🔀 Workspace Filtering

Run commands in specific workspaces using `--filter`:

### By Workspace Name

```bash
# Backend
pnpm --filter backend dev

# Admin Web
pnpm --filter admin-web dev

# Mobile
pnpm --filter mobile start

# Shared packages
pnpm --filter @packages/api-client build
```

### Multiple Workspaces

```bash
# Run in backend and all packages
pnpm --filter ./apps/backend --filter ./packages/* build

# Run in all apps (not packages)
pnpm --filter ./apps/* dev
```

### Using Patterns

```bash
# All packages
pnpm --filter @packages/* build

# All apps
pnpm --filter backend build
pnpm --filter admin-web build
```

---

## 🔄 Recursive Commands

Use `-r` or `--recursive` to run in all workspaces:

```bash
# Run in all workspaces
pnpm -r build
pnpm -r test
pnpm -r lint

# Install dependencies in all workspaces
pnpm -r install
```

---

## 📊 Turborepo Commands

Turborepo handles task orchestration and caching.

### Run Specific Task

```bash
# Run build task in all workspaces
turbo run build

# Run build only
turbo run build --no-cache

# Run in specific workspace
turbo run build --filter backend
```

### View Task Graph

```bash
# Show task dependencies
turbo run build --graph

# Generate graph as file
turbo run build --graph=graph.json
```

### Cache Management

```bash
# Clear Turborepo cache
turbo prune --docker

# View cache info
turbo run build --verbose
```

---

## 🚢 Deployment Commands

### Backend

```bash
# Build
pnpm --filter backend build

# Test production build
pnpm --filter backend start

# With environment
NODE_ENV=production pnpm --filter backend start
```

### Admin Web

```bash
# Build
pnpm --filter admin-web build

# Test production build
pnpm --filter admin-web start

# With environment
NEXT_PUBLIC_API_URL=https://api.prod.com pnpm --filter admin-web build
```

### Mobile

```bash
# Build iOS for App Store
pnpm --filter mobile build:ios

# Build Android for Play Store
pnpm --filter mobile build:android
```

---

## 🐛 Debugging Commands

### With Debug Output

```bash
# Node.js debug
NODE_DEBUG=* pnpm --filter backend dev

# Next.js debug
DEBUG=* pnpm --filter admin-web dev

# Turbo verbose output
turbo run build --verbose
```

### View Process

```bash
# List running processes
ps aux | grep node

# Watch process
watch 'ps aux | grep node'

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 🔗 Dependency Commands

### Add Dependencies

```bash
# Add to specific workspace
pnpm --filter backend add express

# Add dev dependency
pnpm --filter backend add -D @types/express

# Add shared package
pnpm --filter admin-web add @packages/api-client
```

### Remove Dependencies

```bash
# Remove from workspace
pnpm --filter backend remove express
```

### List Dependencies

```bash
# View workspace dependency tree
pnpm --filter backend ls

# View all workspaces
pnpm ls --depth=0
```

---

## 📝 Command Aliases

Create convenient aliases in `.bashrc` or `.zshrc`:

```bash
alias pf="pnpm --filter"
alias pfb="pnpm --filter backend"
alias pfaw="pnpm --filter admin-web"
alias pfm="pnpm --filter mobile"
alias pfpkg="pnpm --filter @packages/*"

# Usage
pfb dev                    # Start backend
pfaw build                 # Build admin web
pfm test                   # Test mobile
pfpkg build                # Build all packages
```

---

## 📋 Common Workflows

### New Feature Development

```bash
# 1. Install and build
pnpm install && pnpm build

# 2. Start development
pnpm dev

# 3. Make changes, test
pnpm --filter <workspace> test

# 4. Check quality
pnpm lint && pnpm format

# 5. Commit
git add . && git commit -m "feat: description"
```

### Debugging Issue

```bash
# 1. Clean and reinstall
pnpm clean && pnpm install

# 2. Build with verbose
turbo run build --verbose

# 3. Run specific tests
pnpm --filter <workspace> test:watch

# 4. Type check
pnpm typecheck
```

### Publishing Release

```bash
# 1. Build all
pnpm build

# 2. Test all
pnpm test

# 3. Check quality
pnpm lint && pnpm format:check

# 4. Version bump
pnpm version

# 5. Publish
npm publish
```

---

## ⚙️ Configuration Files

Scripts are configured in:
- `package.json` - Root and workspace-level scripts
- `turbo.json` - Task configuration and caching
- `.eslintrc.json` - Linting configuration
- `.prettierrc` - Formatting configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Testing configuration (if applicable)

