# Multi-Step Onboarding Wizard

## Overview
A mobile-first, multi-step onboarding wizard that captures user fitness information with local progress persistence, validation, API integration, and analytics tracking.

## Features

### 1. Multi-Step Form
- **Step 1**: Age capture (number input with validation)
- **Step 2**: Fitness objectives (multiple selection checkboxes)
- **Step 3**: Fitness level (radio button selection)
- **Step 4**: Health notes (optional textarea)

### 2. Local Progress Persistence
- Automatically saves form data to localStorage after each input change
- Resumes from last saved step on page reload
- Shows welcome toast when progress is restored
- Clears progress after successful submission

### 3. Validation
- **Age**: Required, must be between 13-120
- **Objectives**: At least one must be selected
- **Fitness Level**: Required selection
- **Health Notes**: Optional, max 500 characters
- Real-time error messages displayed inline
- Visual error states on input fields

### 4. API Integration
- Submits data to `/api/onboarding` endpoint
- Includes proper error handling
- Falls back to mock response for demo purposes
- Loading state with spinner during submission

### 5. Routing
- Redirects to `/dashboard.html` with userId parameter after successful submission
- Dashboard displays success message and user ID

### 6. Analytics Event Tracking
- Tracks following events:
  - `onboarding_started` - When wizard initializes
  - `onboarding_step_completed` - After each step validation
  - `onboarding_step_back` - When user goes back
  - `onboarding_validation_error` - On validation failures
  - `onboarding_submit_attempted` - When form is submitted
  - `onboarding_completed` - On successful submission
  - `onboarding_submit_failed` - On submission errors
  - `dashboard_viewed` - When dashboard loads

- Supports multiple analytics platforms:
  - Google Analytics (gtag)
  - Segment Analytics
  - Mixpanel

### 7. Mobile-First UX
- Responsive design optimized for mobile devices
- Touch-friendly input controls
- Smooth animations and transitions
- Progress bar showing completion percentage
- Step indicators with visual feedback
- Character counter for textarea
- Toast notifications for user feedback
- Dark mode support (respects system preference)

## File Structure
```
/home/engine/project/
├── onboarding.html      # Main onboarding page
├── onboarding.css       # Styling for onboarding wizard
├── onboarding.js        # JavaScript logic and functionality
├── dashboard.html       # Post-onboarding dashboard
└── ONBOARDING_README.md # This documentation
```

## Usage

### 1. Access the Onboarding
Open `onboarding.html` in a web browser or navigate to the hosted URL.

### 2. Complete the Steps
- Enter your age
- Select your fitness objectives
- Choose your fitness level
- Optionally add health notes
- Submit the form

### 3. Resume Progress
If you leave and return, your progress will be automatically restored from where you left off.

### 4. View Dashboard
After successful submission, you'll be redirected to the dashboard.

## Technical Implementation

### Data Storage
Uses `localStorage` with key `onboarding_progress` to store:
```javascript
{
  formData: {
    age: number,
    objectives: string[],
    fitnessLevel: string,
    healthNotes: string
  },
  currentStep: number,
  timestamp: string (ISO 8601)
}
```

### API Request Format
```javascript
POST /api/onboarding
Content-Type: application/json

{
  "age": 25,
  "objectives": ["weight_loss", "general_fitness"],
  "fitnessLevel": "beginner",
  "healthNotes": "No major health issues"
}
```

### API Response Format
```javascript
{
  "success": true,
  "userId": "user_1234567890",
  "message": "Onboarding completed successfully"
}
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- Requires JavaScript enabled
- LocalStorage support required

## Customization

### Colors
Update CSS variables in `onboarding.css`:
```css
:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  /* ... other colors */
}
```

### API Endpoint
Modify the endpoint in `onboarding.js`:
```javascript
const API_ENDPOINT = '/api/onboarding';
```

### Analytics Platforms
The implementation automatically detects and uses available analytics:
- Google Analytics: `window.gtag`
- Segment: `window.analytics`
- Mixpanel: `window.mixpanel`

Add your analytics script tags before `onboarding.js`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Testing Checklist
- ✅ Form validation works on all steps
- ✅ Progress saves and restores correctly
- ✅ Step navigation (next/back) functions properly
- ✅ API submission works (or falls back to mock)
- ✅ Routing to dashboard after submission
- ✅ Analytics events tracked correctly
- ✅ Mobile responsive design
- ✅ Error handling and user feedback
- ✅ Character counter updates
- ✅ Loading states during submission

## Future Enhancements
- Add animation between steps
- Include progress percentage text
- Add skip option for optional steps
- Implement step validation on page load
- Add confirmation dialog before leaving with unsaved progress
- Support for multiple languages
- Add accessibility improvements (ARIA labels, keyboard navigation)
