# API Integration Guide

## Overview
This document describes how the mobile app integrates with the Identity backend API.

## API Client Architecture

### Base Configuration
- **Base URL**: Configured via `EXPO_PUBLIC_API_URL` environment variable
- **Timeout**: 10 seconds
- **Content-Type**: `application/json`
- **Authorization**: Bearer token (auto-injected from secure storage)

### Interceptors

#### Request Interceptor
- Automatically adds `Authorization: Bearer {token}` header
- Retrieves token from secure storage before each request
- Runs on every API call

#### Response Interceptor
- Handles 401 Unauthorized responses
- Automatically clears token on authentication failure
- Allows custom error handling per endpoint

## API Endpoints

### 1. Sign Up
**Endpoint:** `POST /auth/signup`

**Request Body:**
```typescript
{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Server error

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

### 3. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  message: string;
  success: boolean;
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 4. Logout
**Endpoint:** `POST /auth/logout`

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```typescript
{
  message: string;
  success: boolean;
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid/expired token
- `500 Internal Server Error` - Server error

---

### 5. Refresh Token
**Endpoint:** `POST /auth/refresh`

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token
- `500 Internal Server Error` - Server error

---

## Token Management

### Storage
- Tokens stored using Expo Secure Store (encrypted)
- Never stored in AsyncStorage or plain text
- Automatically cleared on logout or 401 response

### Token Lifecycle
1. **Acquisition**: Tokens obtained on signup/login
2. **Storage**: Saved to secure storage immediately
3. **Usage**: Auto-injected in Authorization header
4. **Refresh**: Manual refresh via refresh token endpoint
5. **Expiration**: Cleared on 401 or explicit logout

### Refresh Strategy
- Refresh tokens when receiving 401 response
- Retry original request with new token
- Logout user if refresh fails

## Error Handling

### Network Errors
```typescript
try {
  await identityApi.login(email, password);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network error (no connection)
      showError('No internet connection');
    } else {
      // Server responded with error
      showError(error.response.data.message);
    }
  }
}
```

### Response Error Structure
```typescript
{
  message: string;        // User-friendly error message
  error?: string;         // Error code/type
  statusCode: number;     // HTTP status code
  details?: any;          // Additional error details
}
```

## Request Examples

### Sign Up Request
```typescript
import { identityApi } from './api/identity';

const signUp = async () => {
  try {
    const response = await identityApi.signUp({
      email: 'user@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
    });
    
    // Response includes token, refreshToken, and user
    console.log('User created:', response.user);
  } catch (error) {
    console.error('Sign up failed:', error);
  }
};
```

### Login Request with Token Storage
```typescript
import { identityApi } from './api/identity';
import { saveToken, saveRefreshToken, saveUser } from './utils/secureStorage';

const login = async () => {
  try {
    const response = await identityApi.login({
      email: 'user@example.com',
      password: 'SecurePass123',
    });
    
    // Store tokens securely
    await saveToken(response.token);
    await saveRefreshToken(response.refreshToken);
    await saveUser(response.user);
    
    // Navigate to success screen
  } catch (error) {
    // Handle error
  }
};
```

### Authenticated Request
```typescript
// Token is automatically added to headers
const getUserProfile = async () => {
  try {
    const profile = await apiClient.get('/user/profile');
    return profile;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
    }
  }
};
```

## Security Considerations

### HTTPS Only
- All API requests must use HTTPS
- No plain HTTP allowed in production
- Certificate pinning recommended

### Token Security
- Tokens stored in secure, encrypted storage
- Never log tokens to console in production
- Clear tokens on logout or security events

### Password Security
- Passwords never stored locally
- Only sent over HTTPS
- Server should hash with bcrypt/argon2

### API Key Protection
- API URLs stored in environment variables
- Never commit `.env` files
- Use different keys for dev/staging/production

## Testing

### Mock API Responses
```typescript
jest.mock('./api/identity', () => ({
  identityApi: {
    signUp: jest.fn(() => Promise.resolve({
      token: 'mock_token',
      refreshToken: 'mock_refresh',
      user: { id: '1', email: 'test@example.com' },
    })),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));
```

### Integration Testing
- Test actual API endpoints in staging environment
- Verify error handling for all status codes
- Test token refresh flow
- Validate timeout behavior

## Rate Limiting
- Implement exponential backoff for retries
- Handle 429 Too Many Requests responses
- Show user-friendly messages for rate limits

## Monitoring
- Log API errors (without sensitive data)
- Track request/response times
- Monitor token refresh failures
- Alert on high error rates
