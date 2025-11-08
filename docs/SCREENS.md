# Screen Documentation

## Overview
This document provides detailed information about each screen in the mobile authentication application.

## Screen Flow

```
Welcome Screen
    ├─> Benefits Carousel -> Sign Up -> Success/Failed
    └─> Login -> Success/Failed
           └─> Forgot Password -> Success/Failed
```

## Screen Details

### 1. Welcome Screen
**Route:** `Welcome`  
**Purpose:** Initial landing screen that introduces users to the app

**Features:**
- App introduction message
- "Get Started" button (navigates to Benefits Carousel)
- "Sign In" button (navigates to Login)
- Clean, minimalist design with emoji illustration

**Analytics Events:**
- `screen_view` on mount
- `button_click` for each button interaction

**Accessibility:**
- Header role for title
- Button roles with hints
- VoiceOver/TalkBack support

---

### 2. Benefits Carousel Screen
**Route:** `BenefitsCarousel`  
**Purpose:** Showcase app benefits through an interactive carousel

**Features:**
- Horizontal scrollable carousel with 3 benefit slides
- Each slide contains: emoji, title, description
- Pagination dots showing current slide
- "Skip" button (top right)
- "Next" button (changes to "Get Started" on last slide)
- Automatic analytics tracking per slide

**Benefits Shown:**
1. Secure & Private
2. Easy to Use
3. Always Available

**Analytics Events:**
- `screen_view` on mount
- `benefits_carousel_viewed` on each slide change
- `benefits_carousel_completed` when user completes carousel
- `button_click` for skip/next actions

**Accessibility:**
- Adjustable role for carousel
- Swipe hints for navigation
- Screen reader friendly

---

### 3. Sign Up Screen
**Route:** `SignUp`  
**Purpose:** User registration with email and password

**Form Fields:**
- First Name (required, 2-50 characters)
- Last Name (required, 2-50 characters)
- Email (required, valid email format)
- Password (required, 8+ chars with uppercase, lowercase, number)
- Confirm Password (required, must match password)

**Features:**
- Real-time form validation
- Error messages below each field
- Password visibility toggle
- Loading state during submission
- Link to Login screen for existing users

**Validation Rules:**
- Email: valid format check
- Password: minimum 8 characters, must contain uppercase, lowercase, and number
- All fields required

**Success Flow:**
- Calls Identity API `/auth/signup`
- Stores token in secure storage
- Updates auth context
- Navigates to Success screen

**Error Handling:**
- Network errors
- Invalid credentials
- Server errors
- Navigates to Failed screen with error message

**Analytics Events:**
- `screen_view` on mount
- `signup_started` on mount
- `signup_completed` on success
- `signup_failed` on error
- `button_click` for all interactions

**Accessibility:**
- All inputs have labels and hints
- Error messages use alert role
- Keyboard navigation support

---

### 4. Login Screen
**Route:** `Login`  
**Purpose:** User authentication with email and password

**Form Fields:**
- Email (required, valid email format)
- Password (required)

**Features:**
- Form validation
- Password visibility toggle
- "Forgot Password?" link
- Loading state during submission
- Link to Sign Up screen for new users

**Success Flow:**
- Calls Identity API `/auth/login`
- Stores token in secure storage
- Updates auth context
- Navigates to Success screen

**Error Handling:**
- Invalid credentials
- Network errors
- Server errors
- Navigates to Failed screen with error message

**Analytics Events:**
- `screen_view` on mount
- `login_started` on mount
- `login_completed` on success
- `login_failed` on error
- `button_click` for all interactions

**Accessibility:**
- Full screen reader support
- Proper focus management
- Error announcements

---

### 5. Forgot Password Screen
**Route:** `ForgotPassword`  
**Purpose:** Initiate password reset flow

**Form Fields:**
- Email (required, valid email format)

**Features:**
- Simple single-field form
- Clear instructions
- Loading state during submission
- "Back to Login" link

**Success Flow:**
- Calls Identity API `/auth/forgot-password`
- Shows success message
- Navigates to Success screen

**Error Handling:**
- Invalid email
- Network errors
- User not found
- Navigates to Failed screen with error message

**Analytics Events:**
- `screen_view` on mount
- `forgot_password_started` on mount
- `forgot_password_completed` on success
- `forgot_password_failed` on error
- `button_click` for all interactions

**Accessibility:**
- Clear instructions for screen readers
- Proper form labeling
- Error announcements

---

### 6. Success Screen
**Route:** `Success`  
**Params:** `{ message: string, type: 'signup' | 'login' | 'password-reset' }`  
**Purpose:** Display success feedback for completed operations

**Features:**
- Success checkmark emoji
- Dynamic title based on operation type
- Custom message
- "Continue" button (returns to Welcome)

**Dynamic Titles:**
- `signup`: "Account Created!"
- `login`: "Welcome Back!"
- `password-reset`: "Email Sent!"

**Analytics Events:**
- `screen_view` with type parameter
- `button_click` for continue action

**Accessibility:**
- Success announcement with live region
- Clear action button

---

### 7. Failed Screen
**Route:** `Failed`  
**Params:** `{ message: string, type: 'signup' | 'login' | 'password-reset' }`  
**Purpose:** Display error feedback and recovery options

**Features:**
- Error icon emoji
- Dynamic title based on operation type
- Custom error message
- "Try Again" button (returns to relevant screen)
- "Back to Home" button (returns to Welcome)

**Dynamic Titles:**
- `signup`: "Sign Up Failed"
- `login`: "Login Failed"
- `password-reset`: "Reset Failed"

**Recovery Actions:**
- Try Again navigates to appropriate form screen
- Back to Home navigates to Welcome

**Analytics Events:**
- `screen_view` with type parameter
- `button_click` for all actions

**Accessibility:**
- Error announcement with assertive live region
- Clear recovery options
- Proper button hints

---

## Navigation Patterns

### Forward Navigation
- Welcome -> Benefits -> SignUp
- Welcome -> Login
- Login -> ForgotPassword
- Any auth action -> Success/Failed

### Backward Navigation
- All screens support standard back navigation
- Success/Failed screens provide explicit navigation options
- Deep linking support for recovery flows

## Error Handling Strategy

All screens follow consistent error handling:

1. **Form Validation Errors**: Displayed inline below fields
2. **Network Errors**: Navigate to Failed screen with message
3. **API Errors**: Navigate to Failed screen with server message
4. **Unknown Errors**: Navigate to Failed screen with generic message

## Design Consistency

All screens maintain:
- Consistent spacing (theme.spacing)
- Typography scale (theme.typography)
- Color palette (theme.colors)
- Button styles and states
- Input field styling
- Safe area insets
- Platform-specific adjustments
