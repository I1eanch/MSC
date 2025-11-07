# Monorepo - Full Stack Application

A modern full-stack monorepo built with Turborepo and pnpm, housing three main applications and three shared packages.

## 📋 Overview

This monorepo contains:

- **apps/mobile** - React Native mobile application with TypeScript
- **apps/backend** - NestJS + TypeORM backend API
- **apps/admin-web** - Next.js React admin web application
- **packages/api-client** - Shared API client types and utilities
- **packages/ui-kit** - Shared UI components library
- **packages/analytics-sdk** - Shared analytics SDK wrapper

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (or yarn >= 4.0.0)

### Installation

```bash
# Install dependencies
pnpm install

# Or with yarn
yarn install
```

### Development

Start all applications in development mode:

```bash
pnpm dev
```

Or run specific applications:

```bash
# Backend
pnpm --filter backend dev

# Admin web
pnpm --filter admin-web dev

# Mobile
pnpm --filter mobile start
```

### Building

Build all workspaces:

```bash
pnpm build
```

Build specific workspace:

```bash
pnpm --filter backend build
pnpm --filter admin-web build
```

### Testing

Run tests across all workspaces:

```bash
pnpm test
```

### Linting & Formatting

Check linting:

```bash
pnpm lint
```

Format code:

```bash
pnpm format
```

Verify formatting without changes:

```bash
pnpm format:check
```

### Type Checking

Type check all workspaces:

```bash
pnpm typecheck
```

## 📁 Project Structure

```
monorepo/
├── apps/
│   ├── backend/              # NestJS API server
│   ├── admin-web/            # Next.js admin dashboard
│   └── mobile/               # React Native mobile app
├── packages/
│   ├── api-client/           # Shared API client types
│   ├── ui-kit/               # Shared UI components
│   └── analytics-sdk/        # Analytics wrapper
├── docs/                     # Project documentation
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspaces config
└── README.md
```

## 🛠️ Available Commands

All commands use Turborepo for efficient caching and parallel execution:

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies across all workspaces |
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all workspaces for production |
| `pnpm test` | Run tests in all workspaces |
| `pnpm lint` | Run linting across all workspaces |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm typecheck` | Type check with TypeScript |
| `pnpm clean` | Remove all build artifacts and node_modules |

## 📦 Shared Packages

### @packages/api-client
Shared API client types and utilities for type-safe API communication.

```typescript
import { ApiResponse, createApiClient } from '@packages/api-client';
```

### @packages/ui-kit
Shared UI components, themes, and design tokens.

```typescript
import { colors, spacing, typography } from '@packages/ui-kit';
```

### @packages/analytics-sdk
Analytics wrapper for tracking events across applications.

```typescript
import { createAnalytics } from '@packages/analytics-sdk';
const analytics = createAnalytics({ enabled: true });
analytics.track({ name: 'event_name' });
```

## 🔧 Configuration

### ESLint & Prettier

Root-level ESLint configuration applies to all workspaces with environment-specific overrides:
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration

### TypeScript

- `tsconfig.json` - Root TypeScript configuration
- Each workspace has its own `tsconfig.json` extending the root

### Environment Variables

Each application has an `.env.example` file. Copy to `.env.local` to customize:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env.local

# Admin Web
cp apps/admin-web/.env.example apps/admin-web/.env.local

# Mobile
cp apps/mobile/.env.example apps/mobile/.env.local
```

## 🚢 Deployment

### Backend

```bash
cd apps/backend
pnpm build
pnpm start
```

### Admin Web

```bash
cd apps/admin-web
pnpm build
pnpm start
```

### Mobile

Build for release:

```bash
cd apps/mobile
pnpm build:ios
pnpm build:android
```

## 📚 Documentation

- See `/docs` directory for detailed documentation
- See `CONTRIBUTING.md` for workspace conventions and guidelines

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for our development practices and workspace conventions.

## 📄 License

MIT
