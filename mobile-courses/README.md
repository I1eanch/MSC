# Mobile Courses Learning Platform

A modern, responsive mobile-first learning platform with course catalog, lesson player, progress tracking, and premium gating capabilities.

## Features

### 1. My Courses Catalog
- Browse all available courses with thumbnails and descriptions
- View course instructors and brief descriptions
- See progress indicators showing completion percentage
- Premium courses are clearly marked as locked for free users
- Real-time course catalog updates

### 2. Course Details
- View complete course structure with modules and lessons
- See individual lesson details (title, duration)
- Track lessons by completion status
- Visual indicators for completed lessons (✓) and pending lessons (▶)
- Lesson-level premium gating

### 3. Lesson Player
- Full-screen video player interface (placeholder implementation)
- Display lesson title, duration, and metadata
- Real-time progress updates when completing lessons
- Mark lessons as complete with a single click
- Intuitive navigation back to course

### 4. Progress Tracking
- Real-time progress indicators at course level
- Individual lesson completion tracking
- Visual progress bars with percentage completion
- Progress persists in browser localStorage
- Updates reflected immediately across all views

### 5. Resume Functionality
- Automatic tracking of last viewed lessons
- Resume where you left off (UI ready, easily extensible)
- Persistent user progress state via localStorage
- Session-based progress recovery

### 6. Premium Content Gating
- Premium badge indicators on lessons and courses
- Lock overlay on premium content for free users
- Dedicated premium gate messaging with upgrade prompt
- Real-time subscription state checking
- Seamless upgrade workflow

### 7. Subscription Management
- Toggle between Free and Premium subscription states
- Premium expiration date tracking
- Automatic access control based on subscription
- Visual subscription status indicator in header

## Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6)
- **Storage**: Browser localStorage for state persistence
- **Responsive Design**: Mobile-first approach with media queries
- **Accessibility**: Semantic HTML, keyboard-navigable
- **Performance**: No external dependencies, lightweight

## Project Structure

```
mobile-courses/
├── index.html                 # Main entry point
├── css/
│   └── styles.css            # All styling (responsive, dark mode support)
├── js/
│   └── app.js                # Main application logic
├── data/
│   └── courses.js            # Course catalog and mock data
└── README.md                 # This file
```

## File Descriptions

### index.html
- Entry point for the application
- Contains header with navigation and controls
- Main content container for dynamic rendering
- Loads course data, styles, and app logic

### css/styles.css
- Complete styling using CSS custom properties (variables)
- Mobile-first responsive design
- Dark mode support with theme toggle
- Smooth transitions and hover effects
- Supports screens from 480px to desktop

### js/app.js
- Core `CoursesApp` class managing application state
- Methods for:
  - Course catalog rendering
  - Course detail view rendering
  - Lesson player rendering
  - Premium content access control
  - Progress tracking and updates
  - Subscription state management
  - Theme toggling
  - Local storage persistence
- Event delegation for dynamic content

### data/courses.js
- Course catalog with 3 sample courses
- Mix of free and premium courses
- 8 total lessons across courses
- Subscription state object
- User progress tracking object
- Easily extensible data structure

## Features in Detail

### Real-Time Progress Updates
- Progress is calculated on-the-fly from lesson completion status
- Updates immediately when marking lessons complete
- Percentage displayed at both course and module levels
- Progress persists across browser sessions

### Premium Gating
- Subscription state determines access to premium content
- Visual indicators:
  - 🔒 Lock icon for premium courses
  - "Premium Only" disabled button for locked courses
  - Premium badge on individual premium lessons
- Premium gate screen shows when accessing premium content as free user
- One-click upgrade to premium with "Toggle Premium" button

### Responsive Design
- Desktop: Multi-column layout with optimal spacing
- Tablet: Adjusted typography and spacing
- Mobile (< 768px): Stacked layout, full-width buttons
- Small mobile (< 480px): Compact components

### Theme Support
- Light theme (default)
- Dark theme accessible via 🌙 button
- CSS variables enable easy theme switching
- Persistent theme preference (ready for storage)

## Usage

1. Open `index.html` in a modern web browser
2. Browse the My Courses catalog
3. Click "View Course" to see course details
4. Click "Play" on any free lesson to launch the player
5. Click "Mark as Complete" to update your progress
6. Click "Toggle Premium" to unlock premium content
7. Use 🌙 button to toggle dark mode

## Data Persistence

All user data is stored in browser localStorage:
- `coursesAppState`: Tracks subscription status and progress

The application automatically loads saved state on page load and updates it whenever:
- A lesson is marked complete
- Subscription status changes
- Theme preference changes (ready for storage)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Video player integration (YouTube, Vimeo, HLS streams)
- Quiz and assessment system
- Discussion/comments on lessons
- Certificates of completion
- Instructor messaging
- Search and filtering
- Favorites/bookmarks
- Social sharing
- Offline downloading capability
- Analytics and detailed progress reports

## Implementation Notes

- All lesson player content is placeholder (ready for video integration)
- Course thumbnails are SVG placeholders (ready for real images)
- Premium features fully functional with mock data
- Progress calculations happen in real-time
- No external dependencies - vanilla JavaScript approach
