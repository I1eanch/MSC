# Setup Guide

Complete setup instructions for the monorepo.

## ✅ Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows (WSL2)
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (or yarn >= 4.0.0)
- **Git**: >= 2.0.0

### Optional (for full development)

- **PostgreSQL**: >= 14.0 (for backend database)
- **Docker**: >= 20.0 (for containerized database)
- **Xcode**: >= 14.0 (for iOS development)
- **Android Studio**: >= 2022.1 (for Android development)

## 📥 Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd monorepo
```

### Step 2: Install pnpm

If not already installed:

```bash
npm install -g pnpm@8
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Verify installation:

```bash
pnpm --version
# Should output: 8.x.x or higher
```

### Step 3: Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all workspaces.

### Step 4: Environment Configuration

Create `.env.local` files for each application:

#### Backend

```bash
cp apps/backend/.env.example apps/backend/.env.local
```

Edit `apps/backend/.env.local`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=monorepo_db
JWT_SECRET=your-development-secret-key
```

#### Admin Web

```bash
cp apps/admin-web/.env.example apps/admin-web/.env.local
```

Edit `apps/admin-web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

#### Mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Edit `apps/mobile/.env.local`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ANALYTICS_ENABLED=true
```

### Step 5: Database Setup (Optional)

#### Using Docker

```bash
docker run --name monorepo-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=monorepo_db \
  -p 5432:5432 \
  -d postgres:14-alpine
```

#### Using Local PostgreSQL

```bash
# Create database
createdb -U postgres monorepo_db

# Optionally set password
psql -U postgres -d monorepo_db -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

## 🚀 Running Applications

### Start All Applications

```bash
pnpm dev
```

This starts:
- Backend API on http://localhost:3000
- Admin Web on http://localhost:3001 (or next available port)
- Metro bundler for mobile

### Run Individual Applications

#### Backend Only

```bash
pnpm --filter backend dev
```

Access: http://localhost:3000/api/health

#### Admin Web Only

```bash
pnpm --filter admin-web dev
```

Access: http://localhost:3000 (or configured port)

#### Mobile Only

```bash
pnpm --filter mobile start
```

Then in separate terminal:

```bash
# iOS
pnpm --filter mobile ios

# Android
pnpm --filter mobile android
```

## 🔍 Verification

### Check Installation

```bash
# Verify pnpm
pnpm --version

# Verify Node.js
node --version

# Verify turbo
pnpm exec turbo --version

# Check workspaces
pnpm ls --depth=0
```

### Test Build

Build all packages:

```bash
pnpm build
```

Expected output:
```
✓ backend:build
✓ admin-web:build
✓ api-client:build
✓ ui-kit:build
✓ analytics-sdk:build
...
```

### Quick Start Test

1. Start backend:
   ```bash
   pnpm --filter backend dev
   ```

2. In another terminal, test health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Expected response:
   ```json
   {"status":"Backend API is healthy"}
   ```

## 📁 Useful Directory Shortcuts

```bash
# Navigate to workspaces
cd apps/backend
cd apps/admin-web
cd apps/mobile

cd packages/api-client
cd packages/ui-kit
cd packages/analytics-sdk
```

## 🛠️ IDE Setup

### VS Code

Recommended extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "orta.vscode-jest",
    "ms-vscode.vscode-typescript-vue-plugin",
    "firsttris.vscode-jest-runner",
    "nrwl.angular-console"
  ]
}
```

### WebStorm / IntelliJ

- Enable TypeScript support
- Configure Node interpreter to use project's node
- Set up run configurations for pnpm commands

## 🔧 Common Setup Issues

### Issue: `pnpm: command not found`

**Solution**:
```bash
npm install -g pnpm
```

### Issue: Dependency resolution fails

**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or specify different port
PORT=3001 pnpm --filter backend dev
```

### Issue: PostgreSQL connection fails

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   psql -U postgres
   ```
2. Verify credentials in `.env.local`
3. Check database exists:
   ```bash
   psql -U postgres -l | grep monorepo_db
   ```

## 📝 Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
2. Review [WORKSPACES.md](./WORKSPACES.md) for workspace-specific details
3. Check [CONTRIBUTING.md](../CONTRIBUTING.md) for development practices
4. Start with [SCRIPTS.md](./SCRIPTS.md) to learn available commands

## 💡 Tips

- Use `pnpm install --frozen-lockfile` in CI/CD for reproducible builds
- Run `pnpm clean` to reset build artifacts if you encounter issues
- Use `pnpm -r` or `pnpm --recursive` to run commands in all workspaces
- Check `turbo.json` to understand task caching and dependencies

## 🆘 Getting Help

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review workspace READMEs in individual app directories
- Check git logs and commits for context
- Ask team members or create an issue

