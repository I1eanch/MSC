# Mobile Authentication App

A React Native mobile authentication application with comprehensive user authentication flows.

## Features

- **Welcome Screen**: Initial landing screen with get started and sign in options
- **Benefits Carousel**: Interactive carousel showcasing app benefits
- **Email Sign-Up**: Complete registration flow with form validation
- **Login**: User authentication with email and password
- **Forgot Password**: Password recovery flow
- **Success/Failed States**: User-friendly feedback screens for all operations

## Technical Implementation

### Architecture

- **React Native** with TypeScript for type safety
- **React Navigation** for screen navigation
- **Expo** for rapid development and testing
- **Context API** for state management (Auth & Analytics)

### Key Features

#### Authentication
- Integrated with Identity backend API
- JWT token management with secure storage (expo-secure-store)
- Automatic token refresh on API calls
- Secure logout with storage cleanup

#### Form Validation
- Email validation with regex
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Real-time error feedback
- Accessibility-friendly error messages

#### Secure Storage
- Token storage using expo-secure-store
- Encrypted data persistence
- Automatic token cleanup on logout

#### Accessibility
- ARIA labels and hints on all interactive elements
- Screen reader support
- Keyboard navigation
- Focus management
- Live regions for dynamic content

#### Analytics
- Screen view tracking
- Button click events
- Authentication flow events (started, completed, failed)
- Custom event properties
- Extensible analytics interface

#### Design System
- Consistent color palette
- Typography scale
- Spacing system
- Reusable components (Button, Input)
- iOS and Android platform consistency

## Project Structure

```
/src
  /api
    client.ts          # Axios API client with interceptors
    identity.ts        # Identity API endpoints
  /components
    Button.tsx         # Reusable button component
    Input.tsx          # Form input with validation
  /constants
    theme.ts           # Design system tokens
  /contexts
    AuthContext.tsx    # Authentication state management
    AnalyticsContext.tsx # Analytics tracking
  /screens
    WelcomeScreen.tsx
    BenefitsCarouselScreen.tsx
    SignUpScreen.tsx
    LoginScreen.tsx
    ForgotPasswordScreen.tsx
    SuccessScreen.tsx
    FailedScreen.tsx
  /utils
    analytics.ts       # Analytics utility functions
    secureStorage.ts   # Secure token storage
    validation.ts      # Form validation helpers
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

## API Integration

The app expects the following Identity API endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/refresh` - Token refresh

### Request/Response Examples

**Sign Up:**
```json
POST /auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Testing

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

Type check:
```bash
npm run type-check
```

## Manual QA Checklist

### iOS Testing
- [ ] All screens render correctly
- [ ] Navigation works smoothly
- [ ] Forms validate inputs
- [ ] Keyboard behavior is correct
- [ ] Safe area insets respected
- [ ] Accessibility features work with VoiceOver
- [ ] Success/error states display properly

### Android Testing
- [ ] All screens render correctly
- [ ] Navigation works smoothly
- [ ] Forms validate inputs
- [ ] Keyboard behavior is correct
- [ ] Back button navigation works
- [ ] Accessibility features work with TalkBack
- [ ] Success/error states display properly

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid credentials show proper error
- [ ] Form validation errors are clear
- [ ] Timeout scenarios handled
- [ ] Failed screen provides retry option

### Accessibility
- [ ] All buttons have accessibility labels
- [ ] Form inputs have proper labels and hints
- [ ] Error messages use live regions
- [ ] Screen reader announces all content
- [ ] Focus order is logical
- [ ] Contrast ratios meet WCAG standards

## Security Considerations

- All tokens stored in secure storage (not AsyncStorage)
- HTTPS required for API communication
- Password requirements enforced
- Automatic token cleanup on 401 responses
- No sensitive data in analytics events

## Future Enhancements

- Biometric authentication (Face ID/Touch ID)
- Social login (Google, Apple, Facebook)
- Two-factor authentication
- Email verification flow
- Account deletion
- Profile management
