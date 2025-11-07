# Shared Packages Reference

Complete reference for all shared packages in the monorepo.

## 📦 Overview

Shared packages are located in `packages/` and provide reusable functionality across all applications.

### Benefits

- **Single Source of Truth**: Shared types and utilities defined once
- **Type Safety**: Full TypeScript support
- **Consistency**: All applications use same interfaces
- **Easy Updates**: Changes propagate to all consumers

## 🔗 @packages/api-client

Centralized API client types and utilities for type-safe API communication.

### Location

```
packages/api-client/
├── src/
│   └── index.ts
├── dist/
├── package.json
└── tsconfig.json
```

### Installation

Already included via `workspace:*` protocol in apps.

### Exports

### 1. Types & Interfaces

#### `ApiResponse<T>`

Standard API response structure:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

Usage:

```typescript
import { ApiResponse } from '@packages/api-client';

async function getUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

#### `User`

User entity type:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
```

#### `PaginatedResponse<T>`

Paginated list response:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

Usage:

```typescript
async function getUsers(page = 1): Promise<ApiResponse<PaginatedResponse<User>>> {
  const response = await fetch(`/api/users?page=${page}`);
  return response.json();
}
```

### 2. Constants

#### `API_BASE_URL`

```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

### 3. Utilities

#### `createApiClient(baseURL?)`

Factory function to create API client instance:

```typescript
export function createApiClient(baseURL: string = API_BASE_URL) {
  return {
    baseURL,
    getUrl: (path: string) => `${baseURL}${path}`,
  };
}
```

Usage:

```typescript
import { createApiClient } from '@packages/api-client';

const client = createApiClient('http://api.example.com');
const userUrl = client.getUrl('/users/123');
// → 'http://api.example.com/users/123'
```

### Usage Examples

#### Next.js

```typescript
// pages/users/[id].tsx
import { ApiResponse, User } from '@packages/api-client';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const response: ApiResponse<User> = await fetch(
    `http://localhost:3000/api/users/${id}`
  ).then(r => r.json());
  
  return { props: { user: response.data } };
}
```

#### React Native

```typescript
// services/userService.ts
import { ApiResponse, User } from '@packages/api-client';

export async function fetchUser(userId: string): Promise<User> {
  const response: ApiResponse<User> = await fetch(
    `http://localhost:3000/api/users/${userId}`
  ).then(r => r.json());
  
  return response.data;
}
```

### Build

```bash
pnpm --filter @packages/api-client build
pnpm --filter @packages/api-client typecheck
```

---

## 🎨 @packages/ui-kit

Shared UI components library and design system.

### Location

```
packages/ui-kit/
├── src/
│   └── index.ts
├── dist/
├── package.json
└── tsconfig.json
```

### Installation

Already included via `workspace:*` protocol in apps.

### Exports

### 1. Design Tokens

#### Colors

```typescript
export const colors = {
  primary: '#0066CC',
  secondary: '#666666',
  success: '#00AA00',
  error: '#CC0000',
  warning: '#FFAA00',
  background: '#FFFFFF',
  text: '#000000',
};
```

Usage:

```typescript
import { colors } from '@packages/ui-kit';

// React
const styles = {
  button: {
    backgroundColor: colors.primary,
    color: colors.background,
  },
};

// React Native
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
  },
});
```

#### Spacing

```typescript
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
```

Usage:

```typescript
import { spacing } from '@packages/ui-kit';

const styles = {
  container: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
};
```

#### Typography

```typescript
export const typography = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
  },
};
```

Usage:

```typescript
import { typography } from '@packages/ui-kit';

const styles = {
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
};
```

### 2. Component Interfaces

#### `ButtonProps`

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}
```

Usage:

```typescript
import type { ButtonProps } from '@packages/ui-kit';

// React
export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled, variant }) => (
  <button onClick={onClick} disabled={disabled} className={variant}>
    {label}
  </button>
);

// React Native
import { TouchableOpacity, Text } from 'react-native';

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <TouchableOpacity onPress={onClick}>
    <Text>{label}</Text>
  </TouchableOpacity>
);
```

#### `CardProps`

```typescript
interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
```

Usage:

```typescript
import type { CardProps } from '@packages/ui-kit';

export const Card: React.FC<CardProps> = ({ title, description, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {children}
  </div>
);
```

### 3. Implementing Components

Example Button implementation:

```typescript
// Next.js / React
import type { ButtonProps } from '@packages/ui-kit';
import { colors, spacing } from '@packages/ui-kit';
import styles from './Button.module.css';

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled, variant = 'primary' }) => {
  const bgColor = variant === 'primary' ? colors.primary : colors.secondary;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        color: colors.background,
        padding: spacing.md,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
};
```

```typescript
// React Native
import type { ButtonProps } from '@packages/ui-kit';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@packages/ui-kit';

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    padding: parseInt(spacing.md),
  },
  secondary: {
    backgroundColor: colors.secondary,
    padding: parseInt(spacing.md),
  },
  text: {
    color: colors.background,
  },
});

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => (
  <TouchableOpacity style={styles[variant]} onPress={onClick}>
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);
```

### Usage Examples

#### Next.js

```typescript
// pages/dashboard.tsx
import { colors, spacing, typography } from '@packages/ui-kit';

export default function Dashboard() {
  return (
    <div style={{
      backgroundColor: colors.background,
      padding: spacing.lg,
    }}>
      <h1 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
      }}>
        Dashboard
      </h1>
    </div>
  );
}
```

#### React Native

```typescript
// App.tsx
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@packages/ui-kit';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: parseInt(spacing.lg),
  },
  title: {
    fontSize: parseInt(typography.fontSize.xl),
    fontWeight: typography.fontWeight.bold as unknown as 'normal' | 'bold',
    color: colors.text,
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
    </View>
  );
}
```

### Build

```bash
pnpm --filter @packages/ui-kit build
pnpm --filter @packages/ui-kit typecheck
```

---

## 📊 @packages/analytics-sdk

Shared analytics SDK wrapper for event tracking.

### Location

```
packages/analytics-sdk/
├── src/
│   └── index.ts
├── dist/
├── package.json
└── tsconfig.json
```

### Installation

Already included via `workspace:*` protocol in apps.

### Core Classes & Interfaces

#### `AnalyticsEvent`

```typescript
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}
```

#### `AnalyticsConfig`

```typescript
interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  endpoint?: string;
}
```

#### `Analytics` Class

Main analytics class for tracking events:

```typescript
class Analytics {
  constructor(config: AnalyticsConfig);
  track(event: AnalyticsEvent): void;
  flush(): Promise<void>;
  getEventCount(): number;
}
```

Methods:

- **`track(event)`**: Queue an analytics event
- **`flush()`**: Send queued events to backend
- **`getEventCount()`**: Get number of pending events

### Factory Function

#### `createAnalytics(config)`

```typescript
export function createAnalytics(config: AnalyticsConfig): Analytics {
  return new Analytics(config);
}
```

### Usage Examples

#### Initialization

```typescript
import { createAnalytics } from '@packages/analytics-sdk';

const analytics = createAnalytics({
  enabled: true,
  endpoint: 'http://localhost:3000/api/analytics',
});
```

#### Tracking Events

```typescript
// Simple event
analytics.track({ name: 'page_view' });

// Event with properties
analytics.track({
  name: 'user_signup',
  properties: {
    email: 'user@example.com',
    plan: 'free',
  },
});

// Event with timestamp
analytics.track({
  name: 'purchase',
  properties: { amount: 99.99 },
  timestamp: new Date(),
});
```

#### Next.js Integration

```typescript
// pages/_app.tsx
import { createAnalytics } from '@packages/analytics-sdk';
import { useEffect } from 'react';

const analytics = createAnalytics({
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  endpoint: process.env.NEXT_PUBLIC_API_URL + '/analytics',
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Track page view
    analytics.track({
      name: 'page_view',
      properties: {
        path: window.location.pathname,
      },
    });
  }, []);

  return <Component {...pageProps} />;
}
```

#### React Native Integration

```typescript
// App.tsx
import { useEffect } from 'react';
import { createAnalytics } from '@packages/analytics-sdk';

const analytics = createAnalytics({
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  endpoint: process.env.REACT_APP_API_URL + '/analytics',
});

export default function App() {
  useEffect(() => {
    analytics.track({ name: 'app_opened' });
  }, []);

  return <YourAppComponent />;
}
```

#### Event Batching

Events are automatically batched and sent when queue reaches 10:

```typescript
// First 9 events are queued
for (let i = 0; i < 9; i++) {
  analytics.track({ name: `event_${i}` });
}

console.log(analytics.getEventCount()); // 9

// 10th event triggers flush
analytics.track({ name: 'event_9' });

// Or manual flush
await analytics.flush();
```

### Backend Implementation

The backend should accept POST requests:

```typescript
// Backend endpoint: POST /api/analytics
{
  events: [
    {
      name: 'page_view',
      properties: { path: '/' },
      timestamp: '2024-01-01T12:00:00Z'
    }
  ]
}
```

### Build

```bash
pnpm --filter @packages/analytics-sdk build
pnpm --filter @packages/analytics-sdk typecheck
```

---

## 🔄 Using Shared Packages

### Importing

```typescript
// ✅ Correct
import { colors, spacing } from '@packages/ui-kit';
import { ApiResponse, User } from '@packages/api-client';
import { createAnalytics } from '@packages/analytics-sdk';

// ❌ Avoid
import { colors } from '../../../packages/ui-kit';
```

### In package.json

Shared packages use workspace protocol:

```json
{
  "dependencies": {
    "@packages/api-client": "workspace:*",
    "@packages/ui-kit": "workspace:*",
    "@packages/analytics-sdk": "workspace:*"
  }
}
```

### Building Shared Packages

Build all shared packages:

```bash
pnpm build
```

Build specific package:

```bash
pnpm --filter @packages/api-client build
```

### Publishing

For publishing to npm:

1. Update version in `packages/*/package.json`
2. Remove `"private": true` from package.json
3. Publish to npm registry

---

## 📈 Adding New Exports

### To @packages/api-client

```typescript
// src/index.ts
export interface NewType {
  // ...
}

export function newUtility() {
  // ...
}
```

### To @packages/ui-kit

```typescript
// src/index.ts
export const newTokens = {
  // ...
};

export interface NewComponentProps {
  // ...
}
```

### To @packages/analytics-sdk

```typescript
// src/index.ts
export interface NewConfig {
  // ...
}

export function newTracker(config: NewConfig) {
  // ...
}
```

After adding exports:

```bash
pnpm build
pnpm typecheck
```

