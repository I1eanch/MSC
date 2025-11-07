# Workspace Documentation

Detailed documentation for each workspace in the monorepo.

## 📱 apps/mobile

React Native mobile application for iOS and Android.

### Overview

- **Framework**: React Native 0.72.x
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: (To be configured)
- **Testing**: Jest

### Quick Start

```bash
pnpm --filter mobile start
```

#### Run on iOS

```bash
pnpm --filter mobile ios
```

Prerequisites:
- macOS
- Xcode >= 14.0
- CocoaPods

#### Run on Android

```bash
pnpm --filter mobile android
```

Prerequisites:
- Android Studio
- Android SDK
- Emulator or device connected

### Project Structure

```
apps/mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and utility services
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx
│   └── index.ts
├── ios/                  # iOS native code
├── android/              # Android native code
├── app.json              # App configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
# Start Metro bundler
pnpm --filter mobile start

# Run on iOS simulator
pnpm --filter mobile ios

# Run on Android emulator
pnpm --filter mobile android

# Build iOS release
pnpm --filter mobile build:ios

# Build Android release
pnpm --filter mobile build:android

# Type check
pnpm --filter mobile typecheck

# Lint code
pnpm --filter mobile lint

# Format code
pnpm --filter mobile format
```

### Key Dependencies

- `react-native`: Core framework
- `@react-navigation/native`: Navigation
- `@react-navigation/stack`: Stack navigation
- `@packages/api-client`: API types
- `@packages/ui-kit`: Design tokens
- `@packages/analytics-sdk`: Analytics

### Configuration Files

- `app.json` - App configuration and metadata
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template
- `metro.config.js` - Metro bundler configuration

### Development Tips

1. **Metro Bundler Cache Issues**
   ```bash
   pnpm --filter mobile start --reset-cache
   ```

2. **Clear Build Cache**
   ```bash
   cd apps/mobile/ios
   xcodebuild clean -workspace App.xcworkspace -scheme App
   
   cd ../android
   ./gradlew clean
   ```

3. **Debug Print Statements**
   ```typescript
   console.log('Debug info:', data);
   // View in Metro console
   ```

### Testing

```bash
pnpm --filter mobile test
pnpm --filter mobile test:watch
```

---

## 🌐 apps/admin-web

Next.js admin dashboard web application.

### Overview

- **Framework**: Next.js 14.x
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind (configurable)
- **Data Fetching**: fetch API / React Query (recommended)
- **Testing**: Jest + React Testing Library

### Quick Start

```bash
pnpm --filter admin-web dev
```

Access: http://localhost:3000

### Project Structure

```
apps/admin-web/
├── pages/
│   ├── api/                 # API routes
│   ├── _app.tsx             # App wrapper
│   ├── _document.tsx        # Document wrapper
│   ├── index.tsx            # Home page
│   └── [id].tsx             # Dynamic routes
├── components/              # React components
│   ├── common/              # Shared components
│   └── features/            # Feature-specific components
├── public/                  # Static assets
├── styles/                  # Global styles
├── lib/                     # Utilities
│   ├── api.ts               # API client
│   ├── hooks.ts             # Custom hooks
│   └── utils.ts             # Utility functions
├── types/                   # TypeScript types
├── next.config.js
├── tsconfig.json
└── package.json
```

### Available Scripts

```bash
# Start development server
pnpm --filter admin-web dev

# Build for production
pnpm --filter admin-web build

# Start production server
pnpm --filter admin-web start

# Lint code
pnpm --filter admin-web lint

# Format code
pnpm --filter admin-web format

# Type check
pnpm --filter admin-web typecheck

# Run tests
pnpm --filter admin-web test
```

### Key Dependencies

- `next`: Framework
- `react`: UI library
- `@packages/api-client`: API types
- `@packages/ui-kit`: Design tokens
- `@packages/analytics-sdk`: Analytics

### Configuration Files

- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template

### Features

- **Server-Side Rendering (SSR)**: Dynamic pages rendered on server
- **Static Site Generation (SSG)**: Static pages generated at build time
- **API Routes**: Serverless backend routes
- **Image Optimization**: Automatic image optimization
- **Built-in CSS Support**: CSS Modules and global styles

### Development Tips

1. **Fast Refresh**: Automatic page refresh on file changes
2. **API Routes Development**: Treat `pages/api/*` like serverless functions
3. **Image Optimization**: Use `<Image>` component from Next.js
4. **Data Fetching**: Use `getServerSideProps` or `getStaticProps`

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

Note: Prefix with `NEXT_PUBLIC_` to expose to browser.

### Deployment

```bash
# Build
pnpm --filter admin-web build

# Test production build locally
pnpm --filter admin-web start
```

Options:
- Vercel (recommended for Next.js)
- Docker container
- AWS Lambda / AWS Amplify
- Heroku

---

## 🔌 apps/backend

NestJS backend API with TypeORM and PostgreSQL.

### Overview

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Validation**: Class Validator
- **API Documentation**: OpenAPI/Swagger (to be added)
- **Testing**: Jest

### Quick Start

```bash
pnpm --filter backend dev
```

Access: http://localhost:3000/api

### Project Structure

```
apps/backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── services/           # Business logic
│   ├── entities/           # TypeORM entities
│   ├── dtos/               # Request/Response types
│   ├── guards/             # Authentication guards
│   ├── filters/            # Exception filters
│   ├── interceptors/       # Request/Response interceptors
│   ├── middlewares/        # Custom middlewares
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   ├── seeders/        # Data seeders
│   │   └── data-source.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                   # Test files
├── dist/                   # Build output
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
# Start development server with watch
pnpm --filter backend dev

# Build for production
pnpm --filter backend build

# Start production server
pnpm --filter backend start

# Run tests
pnpm --filter backend test

# Run tests in watch mode
pnpm --filter backend test:watch

# Generate coverage report
pnpm --filter backend test:cov

# Lint code
pnpm --filter backend lint

# Format code
pnpm --filter backend format

# Type check
pnpm --filter backend typecheck

# Database operations
pnpm --filter backend db:migrate       # Run migrations
pnpm --filter backend db:migrate:revert
pnpm --filter backend db:migrate:generate
```

### Key Dependencies

- `@nestjs/core`: Core framework
- `@nestjs/common`: Common utilities
- `@nestjs/platform-express`: Express adapter
- `@nestjs/typeorm`: TypeORM integration
- `typeorm`: ORM
- `postgres`: PostgreSQL driver
- `class-validator`: Input validation
- `class-transformer`: DTO transformation

### NestJS Structure

#### Controllers

```typescript
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
```

#### Services

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }
}
```

#### Entities

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;
}
```

#### DTOs

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;
}
```

### Database Migrations

#### Create Migration

```bash
pnpm --filter backend db:migrate:generate -- src/database/migrations/CreateUserTable
```

#### Run Migrations

```bash
pnpm --filter backend db:migrate
```

#### Revert Migration

```bash
pnpm --filter backend db:migrate:revert
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=monorepo_db
JWT_SECRET=your-secret-key
```

### Development Tips

1. **Dependency Injection**: Use constructor injection for dependencies
2. **Decorators**: Use `@Controller`, `@Injectable`, `@Get`, etc.
3. **Pipes**: Validate input with `ValidationPipe`
4. **Guards**: Protect routes with authentication guards
5. **Interceptors**: Transform responses consistently

### Testing

```bash
# Run all tests
pnpm --filter backend test

# Run specific test file
pnpm --filter backend test -- user.service.spec.ts

# Watch mode
pnpm --filter backend test:watch

# Coverage
pnpm --filter backend test:cov
```

### API Health Check

```bash
curl http://localhost:3000/api/health
# Response: {"status":"Backend API is healthy"}
```

---

## 📦 packages/api-client

Shared API client types and utilities.

### Overview

- **Purpose**: Centralized API type definitions
- **Exports**: Types, interfaces, and utilities
- **Usage**: Imported by all applications

### Quick Start

```typescript
import { ApiResponse, createApiClient } from '@packages/api-client';
```

### Available Exports

```typescript
// Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Utilities
export const API_BASE_URL: string;
export function createApiClient(baseURL?: string): ApiClient;
```

### Usage Example

```typescript
import { ApiResponse, User } from '@packages/api-client';

async function fetchUser(userId: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}
```

### Build

```bash
pnpm --filter @packages/api-client build
```

---

## 🎨 packages/ui-kit

Shared UI components and design tokens.

### Overview

- **Purpose**: Centralized design system
- **Exports**: Components, tokens, and utilities
- **Usage**: Imported by frontend applications

### Design Tokens

#### Colors

```typescript
import { colors } from '@packages/ui-kit';

const {
  primary,      // #0066CC
  secondary,    // #666666
  success,      // #00AA00
  error,        // #CC0000
  warning,      // #FFAA00
  background,   // #FFFFFF
  text,         // #000000
} = colors;
```

#### Spacing

```typescript
import { spacing } from '@packages/ui-kit';

const {
  xs,  // 4px
  sm,  // 8px
  md,  // 16px
  lg,  // 24px
  xl,  // 32px
} = spacing;
```

#### Typography

```typescript
import { typography } from '@packages/ui-kit';

const fontSize = typography.fontSize;
const fontWeight = typography.fontWeight;
```

### Component Types

```typescript
import type { ButtonProps, CardProps } from '@packages/ui-kit';
```

### Build

```bash
pnpm --filter @packages/ui-kit build
```

---

## 📊 packages/analytics-sdk

Shared analytics tracking SDK wrapper.

### Overview

- **Purpose**: Centralized analytics implementation
- **Features**: Event tracking, batching, configurable endpoints
- **Usage**: Imported by all frontend applications

### Quick Start

```typescript
import { createAnalytics } from '@packages/analytics-sdk';

const analytics = createAnalytics({
  enabled: true,
  endpoint: 'http://localhost:3000/api/analytics',
});

analytics.track({ name: 'event_name', properties: {} });
await analytics.flush();
```

### API

```typescript
interface Analytics {
  track(event: AnalyticsEvent): void;
  flush(): Promise<void>;
  getEventCount(): number;
}

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}
```

### Configuration

```typescript
interface AnalyticsConfig {
  enabled: boolean;        // Enable/disable tracking
  trackingId?: string;     // Tracking identifier
  endpoint?: string;       // Backend endpoint for sending events
}
```

### Build

```bash
pnpm --filter @packages/analytics-sdk build
```

---

## 🔗 Workspace Dependencies

Dependency graph:

```
admin-web → @packages/api-client
          → @packages/ui-kit
          → @packages/analytics-sdk

mobile   → @packages/api-client
         → @packages/ui-kit
         → @packages/analytics-sdk

backend  → (standalone, provides API)
```

