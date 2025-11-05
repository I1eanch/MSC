# Architecture

## 🏗️ System Overview

This monorepo implements a modern full-stack architecture with clear separation of concerns across three main applications and three shared packages.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├──────────────────────────┬──────────────────────────────────┤
│   Admin Web (Next.js)    │      Mobile (React Native)       │
│  - Dashboard              │  - Cross-platform mobile app     │
│  - User Management        │  - Native performance            │
│  - Analytics              │  - Navigation stack              │
└──────────────────────────┴──────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared Packages                           │
├──────────────────────────┬──────────────────┬───────────────┤
│  @packages/api-client   │ @packages/ui-kit │  @packages/  │
│  - Type definitions      │  - Components    │  analytics   │
│  - API utilities         │  - Design tokens │  - Tracking  │
│  - HTTP client setup     │  - Themes        │  - Analytics │
└──────────────────────────┴──────────────────┴───────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend API (NestJS + TypeORM)                   │
├─────────────────────────────────────────────────────────────┤
│  - RESTful endpoints                                         │
│  - Business logic                                           │
│  - Database operations                                      │
│  - Authentication & Authorization                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├──────────────┬────────────────────┬───────────────────────┤
│  PostgreSQL  │  File Storage      │  External Services   │
│  - Data      │  - Assets          │  - Analytics service │
│  - Relations │  - Uploads         │  - Third-party APIs  │
└──────────────┴────────────────────┴───────────────────────┘
```

## 📦 Workspace Breakdown

### Applications (apps/)

#### Backend (apps/backend)
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Key Features**:
  - RESTful API endpoints
  - Database migrations
  - Dependency injection
  - Validation pipes
  - Exception handling
- **Port**: 3000 (default)
- **Structure**:
  ```
  apps/backend/src/
  ├── controllers/     # Route handlers
  ├── services/        # Business logic
  ├── entities/        # Database models
  ├── dtos/            # Request/Response types
  ├── database/        # Migrations, data source
  ├── app.module.ts
  ├── app.controller.ts
  └── main.ts
  ```

#### Admin Web (apps/admin-web)
- **Framework**: Next.js 14.x
- **UI Library**: React 18.x
- **Key Features**:
  - Server-side rendering
  - API routes
  - Incremental Static Regeneration
  - Built-in TypeScript support
  - Image optimization
- **Port**: 3000 (default, configurable)
- **Structure**:
  ```
  apps/admin-web/
  ├── pages/           # Next.js pages & API routes
  ├── components/      # React components
  ├── public/          # Static assets
  ├── styles/          # CSS modules / Global styles
  ├── lib/             # Utilities & helpers
  ├── next.config.js
  └── tsconfig.json
  ```

#### Mobile (apps/mobile)
- **Framework**: React Native 0.72.x
- **Key Features**:
  - Cross-platform (iOS & Android)
  - Navigation with React Navigation
  - Native performance
  - TypeScript support
- **Structure**:
  ```
  apps/mobile/src/
  ├── screens/         # Screen components
  ├── navigation/      # Navigation stack
  ├── components/      # Reusable components
  ├── services/        # API & utilities
  ├── App.tsx
  └── index.ts
  ```

### Shared Packages (packages/)

#### @packages/api-client
- **Purpose**: Centralized API client types and utilities
- **Exports**:
  - API response interfaces
  - Base URL configuration
  - HTTP client factory
- **Usage**:
  ```typescript
  import { ApiResponse, createApiClient } from '@packages/api-client';
  ```
- **Key Types**:
  - `ApiResponse<T>` - Standard API response
  - `PaginatedResponse<T>` - List responses
  - `User` - User entity type

#### @packages/ui-kit
- **Purpose**: Shared UI components and design tokens
- **Exports**:
  - Design system (colors, spacing, typography)
  - Component interfaces
  - Theme utilities
- **Usage**:
  ```typescript
  import { colors, spacing, typography } from '@packages/ui-kit';
  import type { ButtonProps, CardProps } from '@packages/ui-kit';
  ```
- **Design Tokens**:
  - Colors: primary, secondary, success, error, warning
  - Spacing: xs, sm, md, lg, xl
  - Typography: font sizes and weights

#### @packages/analytics-sdk
- **Purpose**: Analytics tracking wrapper
- **Features**:
  - Event tracking
  - Batch event sending
  - Configurable endpoints
  - Enable/disable toggle
- **Usage**:
  ```typescript
  import { createAnalytics } from '@packages/analytics-sdk';
  const analytics = createAnalytics({ enabled: true });
  analytics.track({ name: 'event_name' });
  ```

## 🔄 Data Flow

### Request Flow (User → Backend)

1. **Frontend** (Admin Web / Mobile)
   - User interaction triggers API call
   - Uses `@packages/api-client` for type-safe requests
   - Axios handles HTTP transport

2. **Backend** (NestJS)
   - Request received by controller
   - Validation with DTOs
   - Route to appropriate service
   - Service handles business logic
   - TypeORM manages database operations

3. **Response**
   - Service returns data
   - Controller formats response
   - Frontend updates UI

### Analytics Flow

1. **Event Triggered** in any application
2. **@packages/analytics-sdk** queues event
3. **Batch Send** when queue reaches threshold
4. **Backend** receives and processes analytics
5. **Storage** in analytics database

## 🔐 Authentication & Security

### Planned Implementation

- JWT tokens for stateless authentication
- Secure cookie storage on frontend
- CORS configuration on backend
- Input validation at all layers
- Rate limiting on API endpoints

### Best Practices

- Never commit `.env` files with secrets
- Use environment variables for configuration
- Validate all user inputs
- Sanitize output to prevent XSS
- Use HTTPS in production

## 🗄️ Database Design

### TypeORM Configuration

- **Driver**: PostgreSQL
- **Migrations**: Version-controlled schema changes
- **Entities**: TypeScript classes with decorators
- **Relationships**: Type-safe foreign keys

### Entity Relationships

```
User (1) ──→ (N) Session
User (1) ──→ (N) Analytics Event
```

## 🔌 External Integrations

### Available Integration Points

1. **Analytics Service**
   - Configurable endpoint
   - Batch event processing
   - Custom properties support

2. **Third-party APIs**
   - Payment providers
   - Email services
   - Cloud storage

3. **Message Queues** (Future)
   - Event-driven architecture
   - Async processing

## 🔄 Dependency Management

### Root Dependencies

Shared in `package.json`:
- TypeScript, ESLint, Prettier
- Development tools
- Testing frameworks

### Workspace-Specific Dependencies

Managed in individual `package.json`:
- Framework libraries (NestJS, Next.js, React Native)
- Domain-specific packages
- Platform-specific tools

### Workspace Protocol

Local packages use workspace protocol:

```json
{
  "dependencies": {
    "@packages/api-client": "workspace:*"
  }
}
```

Benefits:
- No version mismatches
- Instant updates to shared code
- Works with pnpm hoisting

## 📊 Build & Deploy Strategy

### Development

```
pnpm dev
├── Backend: watches src/ → compiles TypeScript
├── Admin-web: Hot Module Replacement
└── Mobile: Metro bundler watches
```

### Production Build

```
pnpm build
├── Shared packages: tsc compilation
├── Backend: Bundled NestJS app
├── Admin-web: Next.js static + serverless
└── Mobile: Platform-specific binaries
```

### Deployment

- **Backend**: Docker container / Cloud function
- **Admin-web**: Static hosting / Vercel
- **Mobile**: App Store / Google Play

## 🎯 Design Patterns

### Dependency Injection (Backend)

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}
}
```

### Component Composition (Frontend)

```typescript
export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
```

### Factory Pattern (Packages)

```typescript
export function createAnalytics(config: AnalyticsConfig): Analytics {
  return new Analytics(config);
}
```

## 🚀 Scalability Considerations

- **Monorepo**: Single repository simplifies coordination
- **Turborepo**: Caching speeds up builds
- **pnpm**: Efficient disk usage with hoisting
- **TypeScript**: Catches errors early
- **Shared Types**: Single source of truth for API contracts

## 📈 Performance Optimization

- Code splitting with dynamic imports
- Tree-shaking unused code
- Image optimization (Next.js)
- Database query optimization
- Caching strategies

## 🔮 Future Architecture Enhancements

- Microservices decomposition
- Event-driven architecture
- GraphQL API option
- WebSocket support
- PWA capabilities
