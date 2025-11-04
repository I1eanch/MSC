# Contributing Guide

Welcome to the monorepo! This guide outlines the development practices, workspace conventions, and contribution guidelines for this project.

## 🎯 Workspace Conventions

### Naming Conventions

- **Workspaces**: kebab-case (e.g., `admin-web`, `api-client`)
- **Packages**: camelCase when imported (e.g., `@packages/apiClient`)
- **Files**: kebab-case for files (e.g., `app.controller.ts`)
- **Variables/Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

### Import Paths

Always use absolute imports with workspace aliases:

```typescript
// ✅ Correct
import { colors } from '@packages/ui-kit';
import { Analytics } from '@packages/analytics-sdk';
import { ApiResponse } from '@packages/api-client';

// ❌ Avoid
import { colors } from '../../../packages/ui-kit';
```

### Directory Structure

Each workspace follows a consistent structure:

```
workspace/
├── src/
│   ├── components/     (React/React Native)
│   ├── pages/          (Next.js pages)
│   ├── controllers/    (NestJS controllers)
│   ├── services/       (Business logic)
│   ├── types/          (TypeScript types)
│   ├── utils/          (Utilities)
│   └── index.ts
├── dist/               (Build output)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 📝 Code Style

### TypeScript

- Always use TypeScript for all source files
- Strict mode enabled (`"strict": true`)
- Interfaces over type aliases for object types
- Explicit function return types (especially for public APIs)

```typescript
// ✅ Correct
interface User {
  id: string;
  email: string;
}

export function fetchUser(id: string): Promise<User> {
  // ...
}

// ❌ Avoid
type User = {
  id: string;
  email: string;
};

export function fetchUser(id) {
  // ...
}
```

### Formatting

All code is formatted with Prettier:

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

Configuration in `.prettierrc`:
- Semi-colons: true
- Single quotes: true
- Trailing commas: es5
- Line width: 100
- Tab width: 2

### Linting

ESLint enforces code quality:

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint --fix
```

Environment-specific rules apply:

**Backend (NestJS)**:
- Explicit return types recommended
- Dependency injection patterns enforced

**Admin Web (Next.js)**:
- Next.js recommended practices enforced
- React hooks linting enabled

**Mobile (React Native)**:
- React Native specific rules applied
- Cross-platform component conventions

## 🧪 Testing

### Backend (NestJS)

```bash
cd apps/backend
pnpm test              # Run tests once
pnpm test:watch       # Run in watch mode
pnpm test:cov         # Generate coverage report
```

### Admin Web (Next.js)

```bash
cd apps/admin-web
pnpm test              # Run tests
```

### Mobile (React Native)

```bash
cd apps/mobile
pnpm test              # Run tests
```

## 🏗️ Creating New Packages

To add a new shared package:

1. Create directory under `packages/`:
```bash
mkdir packages/new-package
```

2. Create basic structure:
```bash
mkdir packages/new-package/src
touch packages/new-package/package.json
touch packages/new-package/tsconfig.json
touch packages/new-package/src/index.ts
```

3. Add to `pnpm-workspace.yaml` (already includes `packages/*`)

4. Install dependencies:
```bash
pnpm install
```

5. Reference in other workspaces using workspace protocol:
```json
{
  "dependencies": {
    "@packages/new-package": "workspace:*"
  }
}
```

## 🔄 Dependency Management

### Adding Dependencies

Use workspace protocol for local packages:

```bash
pnpm add -D @packages/ui-kit
# In package.json: "@packages/ui-kit": "workspace:*"
```

For external packages:

```bash
pnpm add axios
pnpm add -D @types/node --save-dev
```

### Shared Dependencies

Shared dependencies (TypeScript, ESLint, etc.) are in the root `package.json` for consistency.

### Version Management

Version packages with:
```bash
pnpm version
```

## 🔍 Git Workflow

### Branch Naming

Use descriptive branch names:
- `feat-<workspace>-<feature>` - New features
- `fix-<workspace>-<issue>` - Bug fixes
- `docs-<topic>` - Documentation updates
- `refactor-<workspace>-<component>` - Refactoring

Example:
```bash
git checkout -b feat-admin-web-user-dashboard
git checkout -b fix-backend-auth-validation
```

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
feat(admin-web): add user management dashboard

Implement CRUD operations for user management with pagination
and filtering capabilities.

Closes #123
```

### PR Guidelines

Before submitting a PR:

1. Ensure all tests pass:
```bash
pnpm test
```

2. Check linting:
```bash
pnpm lint
```

3. Verify formatting:
```bash
pnpm format:check
```

4. Type check:
```bash
pnpm typecheck
```

5. Build affected packages:
```bash
pnpm build
```

## 🐛 Debugging

### Backend (NestJS)

```bash
cd apps/backend
NODE_DEBUG=* pnpm dev
```

### Admin Web (Next.js)

```bash
cd apps/admin-web
DEBUG=* pnpm dev
```

### Mobile (React Native)

```bash
cd apps/mobile
pnpm start
# Separate terminal: pnpm android or pnpm ios
```

## 📦 Dependency Graph

View dependency relationships:

```bash
pnpm ls --depth=0
```

## 🚀 Performance

### Build Optimization

Turborepo caches builds. To reset cache:

```bash
pnpm clean
pnpm install
pnpm build
```

### Development Mode

Use `--parallel` for concurrent builds (default):

```bash
pnpm build
```

Or sequential:

```bash
pnpm build --concurrency=1
```

## 📚 Documentation

When adding features:

1. Update relevant workspace README
2. Add JSDoc comments to public APIs
3. Update `/docs` if architectural changes
4. Add examples in CONTRIBUTING.md if new patterns

## 🆘 Common Issues

### Port Conflicts

Default ports:
- Backend API: `3000`
- Admin Web: `3000` (Next.js default)
- Mobile: `8081` (Metro bundler)

Override with environment variables or CLI flags.

### Dependency Conflicts

Clear and reinstall:

```bash
pnpm clean
pnpm install
```

### Type Errors in Shared Packages

After modifying shared packages:

```bash
pnpm build
pnpm typecheck
```

## 📞 Getting Help

- Check existing issues and PRs
- Read workspace-specific documentation in `/docs`
- Review similar implementations in the codebase
- Ask team members or create a discussion

## ✅ Checklist Before PR

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Builds without errors
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Commit messages follow conventions
- [ ] Related issues referenced

Thank you for contributing! 🎉
