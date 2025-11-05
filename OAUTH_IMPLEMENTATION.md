# OAuth Social Login Implementation

This document describes the OAuth social login integration for Apple, Google, VK, and Yandex providers.

## Features

✅ **Multiple OAuth Providers**
- Google OAuth 2.0
- Apple Sign In
- VK OAuth
- Yandex OAuth

✅ **Account Linking**
- Automatically links OAuth accounts to existing email-based accounts
- Prevents duplicate accounts with same email
- Rejects linking when email is already associated with a different provider

✅ **Token Exchange**
- Validates OAuth tokens with provider APIs
- Exchanges OAuth tokens for JWT access/refresh tokens
- Secure token storage in secure storage (mobile)

✅ **Password Fallback**
- Users can set a password after OAuth sign-up
- Existing password-based accounts can be linked to OAuth providers
- Maintains backward compatibility with password-only authentication

✅ **Mobile Integration**
- Uses Expo AuthSession for OAuth flows
- Native Apple Sign In on iOS
- Consistent UI across all providers

✅ **Automated Tests**
- Unit tests for OAuth service (backend)
- Integration tests for OAuth endpoints (e2e)
- Component tests for mobile OAuth flows

## Architecture

### Backend

```
backend/
├── src/
│   ├── auth/
│   │   ├── oauth.service.ts          # OAuth provider validation
│   │   ├── auth.service.ts           # Extended with OAuth methods
│   │   ├── auth.controller.ts        # POST /auth/oauth/login endpoint
│   │   ├── auth.resolver.ts          # GraphQL oauthLogin mutation
│   │   └── dto/
│   │       └── oauth-login.dto.ts    # OAuth request/response DTOs
│   └── database/
│       ├── entities/
│       │   └── user.entity.ts        # Extended with OAuth fields
│       └── migrations/
│           └── ...AddOAuthFieldsToUser.ts
└── test/
    └── oauth.e2e-spec.ts             # OAuth integration tests
```

### Mobile

```
src/
├── api/
│   └── identity.ts                    # OAuth login API client
├── contexts/
│   └── AuthContext.tsx                # Extended with loginWithOAuth
├── screens/
│   ├── LoginScreen.tsx                # Added OAuth buttons
│   └── SignUpScreen.tsx               # Added OAuth buttons
└── utils/
    └── oauth.ts                        # OAuth provider integrations
```

## API Reference

### REST Endpoint

**POST /auth/oauth/login**

Request:
```json
{
  "provider": "google" | "apple" | "vk" | "yandex",
  "accessToken": "string",
  "idToken": "string (optional, required for Apple)",
  "userData": {
    "fullName": "string (optional)"
  }
}
```

Response:
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "provider": "google",
    "role": "user"
  }
}
```

### GraphQL Mutation

```graphql
mutation OAuthLogin($oauthDto: OAuthLoginDto!) {
  oauthLogin(oauthDto: $oauthDto) {
    accessToken
    refreshToken
    user {
      id
      email
      provider
      role
    }
  }
}
```

## OAuth Provider Configuration

### Google

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URIs:
   - For mobile: `com.example.mobileauthapp:/oauth2redirect/google`
   - For web: `http://localhost:3000/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID` environment variable

### Apple

1. Configure Sign in with Apple in [Apple Developer Portal](https://developer.apple.com/)
2. Create a Service ID and configure return URLs
3. Enable Apple Sign In capability in your app
4. No environment variable needed (uses native SDK on iOS)

### VK

1. Create an app in [VK Developers](https://vk.com/dev)
2. Configure OAuth settings
3. Add redirect URI: `com.example.mobileauthapp:/oauth2redirect/vk`
4. Set `VK_CLIENT_ID` environment variable

### Yandex

1. Create an app in [Yandex OAuth](https://oauth.yandex.ru/)
2. Set callback URL: `com.example.mobileauthapp:/oauth2redirect/yandex`
3. Request permissions: `login:email`, `login:info`, `login:avatar`
4. Set `YANDEX_CLIENT_ID` environment variable

## Database Schema

New fields added to `users` table:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| provider | varchar | Yes | OAuth provider name (google, apple, vk, yandex) |
| providerId | varchar | Yes | Unique user ID from OAuth provider |
| providerData | json | Yes | Additional data from OAuth provider (name, picture, etc.) |
| password | varchar | Yes | Now nullable to support OAuth-only accounts |

Index: `(provider, providerId)` for fast OAuth user lookups

## Account Linking Logic

1. **New OAuth user**: Creates account with provider and providerId
2. **Existing email (no provider)**: Links OAuth to existing password-based account
3. **Existing email (same provider)**: Logs in existing OAuth user
4. **Existing email (different provider)**: Rejects with error message

```typescript
if (user with provider + providerId exists) {
  return user
} else if (user with email exists) {
  if (user has different provider) {
    throw error
  } else {
    link OAuth provider to user
    return user
  }
} else {
  create new user with OAuth
  return user
}
```

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test src/auth/oauth.service.spec.ts

# E2E tests
npm run test:e2e oauth.e2e-spec.ts
```

### Mobile Tests

```bash
# Root directory
npm run test __tests__/oauth.test.tsx
```

## Security Considerations

✅ OAuth tokens are validated with provider APIs before accepting
✅ JWT tokens are generated server-side after validation
✅ Refresh tokens are stored securely in database
✅ Password field is nullable but can be set later for added security
✅ Account linking requires matching email to prevent takeover
✅ Provider mismatch is detected and rejected

## Troubleshooting

### "Invalid OAuth token"
- Ensure OAuth token hasn't expired
- Verify client ID matches between mobile and provider
- Check redirect URIs are correctly configured

### "This email is already linked with [provider]"
- User tried to sign in with a different provider than originally used
- Instruct user to use the original provider or reset account

### Apple Sign In not working
- Verify Apple Sign In capability is enabled in Xcode
- Check bundle identifier matches Apple Developer configuration
- Ensure running on physical iOS device (simulator may have issues)

### VK email not returned
- Ensure "email" scope is requested in OAuth flow
- User must have verified email in VK account

## Future Enhancements

- [ ] Social profile picture sync
- [ ] Link multiple OAuth providers to one account
- [ ] OAuth token refresh support
- [ ] Additional providers (Facebook, Twitter, GitHub)
- [ ] Admin panel for OAuth provider management
