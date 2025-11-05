# Troubleshooting Guide

Solutions for common issues encountered during development and deployment.

## 🔍 Installation Issues

### Issue: `pnpm: command not found`

**Cause**: pnpm is not installed globally

**Solution**:
```bash
npm install -g pnpm@8
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Verify**:
```bash
pnpm --version
```

---

### Issue: `ERR! ERR_PNPM_FROZEN_LOCKFILE`

**Cause**: Lock file is out of sync with package.json

**Solution**:
```bash
# Option 1: Remove and reinstall
rm pnpm-lock.yaml
pnpm install

# Option 2: Install with update
pnpm install --no-frozen-lockfile
```

---

### Issue: Dependency resolution errors

**Cause**: Conflicting version requirements

**Solution**:
```bash
# Clean everything
pnpm clean
rm pnpm-lock.yaml
rm -rf node_modules

# Reinstall
pnpm install

# If still fails, check for version conflicts
pnpm ls --depth=0
```

---

## 🚀 Development Issues

### Issue: Port 3000 already in use

**Cause**: Another process is using the port

**Solution**:

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 pnpm --filter backend dev
```

---

### Issue: Module not found errors

**Cause**: Shared packages not built

**Solution**:
```bash
# Build shared packages first
pnpm build

# Or specifically
pnpm --filter @packages/api-client build
pnpm --filter @packages/ui-kit build
```

---

### Issue: TypeScript errors in shared packages

**Cause**: tsconfig not properly configured

**Solution**:
```bash
# Type check shared packages
pnpm --filter @packages/api-client typecheck

# Check workspace paths in tsconfig.json
# Ensure paths are relative to workspace root
```

---

### Issue: `Cannot find module '@packages/...'`

**Cause**: Workspace protocol not set correctly

**Solution**:

1. Check `package.json`:
```json
{
  "dependencies": {
    "@packages/api-client": "workspace:*"
  }
}
```

2. Run install:
```bash
pnpm install
```

3. Rebuild dependencies:
```bash
pnpm build
```

---

## 🔌 Backend Issues

### Issue: Database connection fails

**Cause**: PostgreSQL not running or credentials wrong

**Solution**:

```bash
# Check if PostgreSQL is running
psql -U postgres

# If connection fails, start PostgreSQL
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Docker
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14-alpine
```

**Verify connection**:
```bash
psql -U postgres -d monorepo_db
```

---

### Issue: Migration fails

**Cause**: Database schema mismatch

**Solution**:
```bash
# Revert migration
pnpm --filter backend db:migrate:revert

# Regenerate migration
pnpm --filter backend db:migrate:generate

# Check migration file and fix if needed
# Then run again
pnpm --filter backend db:migrate
```

---

### Issue: NestJS application won't start

**Cause**: Missing dependencies or type errors

**Solution**:
```bash
# Type check
pnpm --filter backend typecheck

# Check for missing dependencies
pnpm --filter backend ls

# Rebuild
pnpm --filter backend build

# Run with verbose logging
NODE_DEBUG=* pnpm --filter backend dev
```

---

### Issue: API endpoint returns 404

**Cause**: Route not defined or controller not registered

**Solution**:

1. Check controller has `@Controller()` decorator:
```typescript
@Controller('api/users')
export class UserController {
  // routes...
}
```

2. Check module imports controller:
```typescript
@Module({
  controllers: [UserController],
})
export class AppModule {}
```

3. Test endpoint:
```bash
curl http://localhost:3000/api/health
```

---

## 🌐 Admin Web Issues

### Issue: Next.js dev server won't start

**Cause**: Port in use or configuration error

**Solution**:
```bash
# Clear Next.js cache
pnpm --filter admin-web clean
rm -rf apps/admin-web/.next

# Restart
pnpm --filter admin-web dev

# Or use different port
PORT=3001 pnpm --filter admin-web dev
```

---

### Issue: Shared package imports not resolving

**Cause**: transpilePackages not configured

**Solution**:

Check `apps/admin-web/next.config.js`:
```javascript
module.exports = {
  transpilePackages: ['@packages/api-client', '@packages/ui-kit', '@packages/analytics-sdk'],
};
```

Then restart dev server.

---

### Issue: Build fails with module errors

**Cause**: Unbuilt shared packages

**Solution**:
```bash
# Build all packages
pnpm build

# Then build admin-web
pnpm --filter admin-web build

# Check for specific errors
pnpm --filter admin-web build --verbose
```

---

### Issue: Environment variables not loading

**Cause**: Missing NEXT_PUBLIC_ prefix or wrong file

**Solution**:

1. Check file location: `apps/admin-web/.env.local`
2. Use `NEXT_PUBLIC_` prefix for browser variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Restart dev server for changes to take effect

---

## 📱 Mobile Issues

### Issue: Metro bundler cache issues

**Cause**: Stale cache from previous builds

**Solution**:
```bash
# Clear cache and restart
pnpm --filter mobile start --reset-cache

# Or manually clear
rm -rf apps/mobile/node_modules/.cache
```

---

### Issue: iOS build fails

**Cause**: CocoaPods or Xcode issues

**Solution**:
```bash
# Clear iOS build
cd apps/mobile/ios
rm -rf Pods Podfile.lock
pod install

# Try building again
cd ../..
pnpm --filter mobile ios
```

**Check Xcode version**:
```bash
xcode-select --print-path
# Should be >= 14.0
```

---

### Issue: Android build fails

**Cause**: Gradle cache or Android SDK issues

**Solution**:
```bash
# Clear Gradle cache
cd apps/mobile/android
./gradlew clean

# Try building again
cd ../..
pnpm --filter mobile android

# Or clear everything
rm -rf apps/mobile/android/.gradle
```

**Check Android SDK**:
```bash
$ANDROID_HOME/tools/bin/sdkmanager --list
```

---

### Issue: Module not found in mobile

**Cause**: Shared packages not linked

**Solution**:
```bash
# Reinstall
pnpm install

# Clear cache
pnpm --filter mobile start --reset-cache

# Rebuild shared packages
pnpm build
```

---

## 🔗 Shared Package Issues

### Issue: Package exports not working

**Cause**: Package.json not properly configured

**Solution**:

Check `packages/api-client/package.json`:
```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Then build:
```bash
pnpm --filter @packages/api-client build
```

---

### Issue: Build doesn't generate types

**Cause**: TypeScript configuration issue

**Solution**:

Check `packages/api-client/tsconfig.json`:
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

Rebuild:
```bash
pnpm --filter @packages/api-client build
```

---

## 🔄 Turborepo Issues

### Issue: Turbo cache not working

**Cause**: Cache invalidated by changes

**Solution**:
```bash
# Clear cache
pnpm --filter turbo run build --no-cache

# Check cache
pnpm --filter turbo run build --verbose
```

---

### Issue: Task dependencies not running

**Cause**: turbo.json configuration issue

**Solution**:

Check `turbo.json`:
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

---

## 🧪 Testing Issues

### Issue: Jest tests fail

**Cause**: Module resolution or configuration

**Solution**:
```bash
# Run with verbose output
pnpm --filter backend test -- --verbose

# Clear Jest cache
pnpm --filter backend test -- --clearCache

# Check jest.config.js configuration
```

---

### Issue: Type errors in tests

**Cause**: Test files not included in tsconfig

**Solution**:

Check `apps/backend/tsconfig.json`:
```json
{
  "include": ["src/**/*", "**/*.spec.ts"]
}
```

---

## 📊 Build Issues

### Issue: Build takes too long

**Cause**: Inefficient build configuration

**Solution**:
```bash
# Check what's slow
turbo run build --verbose

# Use parallel builds
pnpm build --parallel

# Skip cache invalidation
turbo run build --no-cache
```

---

### Issue: Build succeeds locally but fails in CI

**Cause**: Environment differences

**Solution**:
```bash
# Test production build locally
NODE_ENV=production pnpm build

# Check for uncommitted files
git status

# Verify environment variables
env | grep -i api
```

---

## 🔐 Security Issues

### Issue: Security vulnerabilities in dependencies

**Cause**: Outdated packages

**Solution**:
```bash
# Audit
npm audit

# Fix automatically
npm audit fix

# Or update specific packages
pnpm update react@latest
```

---

## 📋 General Debugging

### Enable Verbose Logging

```bash
# Turbo verbose
turbo run build --verbose

# Node.js debug
NODE_DEBUG=* pnpm --filter backend dev

# Next.js debug
DEBUG=* pnpm --filter admin-web dev

# pnpm verbose
pnpm --verbose install
```

### Check File Permissions

```bash
# macOS/Linux
ls -la apps/backend/src

# If needed, fix permissions
chmod -R 755 apps/backend/src
```

### Verify Node.js Version

```bash
node --version
# Should be >= 18.0.0

# Check with nvm
nvm install 18
nvm use 18
```

---

## 🆘 Getting More Help

1. **Check workspace-specific README**: `apps/*/README.md`
2. **Review documentation**: `/docs`
3. **Search existing issues**: `git log --grep="error"`
4. **Check dependency docs**: Visit official docs for framework
5. **Create minimal reproduction**: Isolate the issue
6. **Ask team**: Consult with other developers

---

## 🐛 Reporting Issues

When reporting an issue, include:

1. Error message (full stack trace)
2. Steps to reproduce
3. Environment info:
   ```bash
   node --version
   pnpm --version
   npm audit
   ```
4. Workspace affected
5. Recent changes made

Example:

```
Workspace: backend
Error: Cannot find module '@packages/api-client'
Steps:
1. pnpm install
2. pnpm --filter backend dev
Environment: Node 18.12.0, pnpm 8.0.0
```

