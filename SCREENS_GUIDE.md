# Training Mobile UI - Screens Guide

This guide provides detailed information about each screen in the application.

## 📱 Screen Flow

```
┌─────────────────────┐
│  Weekly Plan Screen │ ◄─── HOME SCREEN
│  (WeeklyPlanScreen) │
└──────────┬──────────┘
           │
    ┌──────┴───────┬─────────────┐
    │              │             │
    ▼              ▼             ▼
┌────────┐   ┌──────────┐  ┌──────────┐
│Workout │   │ History  │  │ Summary  │
│ Detail │   │  Screen  │  │  Modal   │
└────────┘   └──────────┘  └──────────┘
```

## 1️⃣ Weekly Plan Screen

**File:** `mobile-app/src/screens/WeeklyPlanScreen.tsx`

**Purpose:** Main home screen showing weekly workout overview

### Features:
- **Header Section:**
  - Week number display
  - "Training Plan" subtitle
  - History button
  - Summary button

- **Progress Section:**
  - Visual progress bar
  - Completed/Total workouts counter
  - Completion percentage

- **Workouts List:**
  - Scrollable list of workout cards
  - Each card shows:
    - Day of the week
    - Workout title
    - Number of exercises
    - Start/Review button
    - Completion badge (if completed)

### Navigation:
- Tap workout card → Navigate to Workout Detail
- Tap "History" → Navigate to History Screen
- Tap "Summary" → Open Weekly Summary Modal

### Visual Elements:
- Blue header (#2196F3)
- White workout cards
- Green accent for completed items
- Progress bar with gradient fill

### Props:
```typescript
interface WeeklyPlanScreenProps {
  weekPlan: WeekPlan;
  onWorkoutPress: (workout: Workout) => void;
  onNavigateToHistory: () => void;
}
```

---

## 2️⃣ Workout Detail Screen

**File:** `mobile-app/src/screens/WorkoutDetailScreen.tsx`

**Purpose:** Display workout details with video player for exercises

### Features:
- **Header Section:**
  - Back button
  - Workout day
  - Workout title

- **Exercise Header:**
  - Current exercise number (e.g., "Exercise 1 of 5")
  - Exercise name

- **Video Player:**
  - Full-width video player
  - Play/Pause button overlay
  - Loading indicator
  - Error handling with retry

- **Exercise Information:**
  - Duration card (large display of time)
  - Instructions card with detailed description

- **Navigation Buttons:**
  - Previous exercise button
  - Next exercise button
  - Buttons disabled at start/end

- **All Exercises List:**
  - List of all exercises in workout
  - Tap to jump to specific exercise
  - Current exercise highlighted
  - Shows duration for each

- **Footer:**
  - Complete Workout button (if not completed)
  - Completed indicator (if already completed)

### Navigation:
- Back button → Return to Weekly Plan
- Previous/Next → Navigate between exercises
- Tap exercise in list → Jump to that exercise
- Complete Workout → Confirmation → Back to Weekly Plan

### Visual Elements:
- Blue header
- White content cards
- Green complete button
- Highlighted current exercise (blue background)

### Props:
```typescript
interface WorkoutDetailScreenProps {
  workout: Workout;
  onComplete: (workoutId: string) => void;
  onBack: () => void;
}
```

---

## 3️⃣ History Screen

**File:** `mobile-app/src/screens/HistoryScreen.tsx`

**Purpose:** Display chronological list of completed workouts

### Features:
- **Header Section:**
  - Back button
  - "Workout History" title

- **Statistics Cards:**
  - Total Workouts card (green highlight)
  - Total Exercises card (green highlight)

- **History List:**
  - Scrollable list of completed workouts
  - Sorted by completion date (newest first)
  - Each entry shows:
    - Workout title
    - Completion badge
    - Date (formatted: "Mon, Jan 1, 2024")
    - Time (formatted: "02:30 PM")
    - List of exercises with durations

- **Empty State:**
  - Shown when no history exists
  - Icon, title, and descriptive text
  - Encourages user to complete first workout

### Navigation:
- Back button → Return to Weekly Plan

### Visual Elements:
- Blue header
- White stat cards with green numbers
- Green left border on history cards
- Completion badges
- Calendar and clock emojis

### Props:
```typescript
interface HistoryScreenProps {
  history: WorkoutHistory[];
  onBack: () => void;
}
```

---

## 4️⃣ Weekly Summary Modal

**File:** `mobile-app/src/components/WeeklySummaryModal.tsx`

**Purpose:** Show comprehensive weekly statistics in a modal

### Features:
- **Modal Overlay:**
  - Semi-transparent background
  - Slide-up animation
  - 90% screen width
  - 80% max height

- **Header:**
  - "Weekly Summary" title

- **Statistics Cards:**
  - Completion Rate (large percentage display)
  - Completed Workouts count
  - Total Workouts count
  - Total Exercises count

- **Workouts List:**
  - All workouts with status
  - Each entry shows:
    - Day of week
    - Workout title
    - Status (Completed/Pending)
  - Color-coded status text

- **Close Button:**
  - Blue button at bottom
  - Closes modal

### Navigation:
- Close button → Dismiss modal
- Tap outside → Dismiss modal (native behavior)

### Visual Elements:
- White modal background
- Large green percentage
- Stat cards with gray background
- Green accent for completed
- Orange accent for pending

### Props:
```typescript
interface WeeklySummaryModalProps {
  visible: boolean;
  weekPlan: WeekPlan;
  onClose: () => void;
}
```

---

## 🎥 Video Player Component

**File:** `mobile-app/src/components/VideoPlayer.tsx`

**Purpose:** Reusable video player with background playback support

### Features:
- **Video Display:**
  - Full-width container
  - 250px fixed height
  - Black background
  - Contain resize mode

- **Loading State:**
  - Activity indicator
  - "Loading video..." text
  - Semi-transparent overlay

- **Controls:**
  - Play/Pause button (bottom-right)
  - Large, easy-to-tap button
  - Play (▶) and Pause (⏸) icons

- **Error Handling:**
  - Error message display
  - Retry button
  - User-friendly error text

- **Background Playback:**
  - Audio mode configured
  - Continues playing in background
  - Works in silent mode (iOS)

### Props:
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}
```

---

## 🎨 Design System

### Colors
```typescript
Primary Blue:    #2196F3  // Headers, buttons, active states
Success Green:   #4CAF50  // Completed, success
Warning Orange:  #FF9800  // Pending states
Error Red:       #f44336  // Errors
Background:      #f5f5f5  // Screen background
Card White:      #ffffff  // Cards
Text Primary:    #333333  // Main text
Text Secondary:  #666666  // Supporting text
Light Gray:      #e0e0e0  // Borders, disabled
```

### Typography
```typescript
Header Title:    28px, bold       // Screen titles
Section Title:   24px, bold       // Major sections
Card Title:      20px, bold       // Card headers
Subtitle:        18px, bold       // Subsections
Body:            16px, regular    // Main content
Detail:          14px, regular    // Supporting text
Caption:         12px, regular    // Small labels
```

### Spacing
```typescript
Screen Padding:  20px
Card Padding:    20px
Section Margin:  15px
Element Gap:     10px
Small Gap:       5px
```

### Border Radius
```typescript
Cards:           12px
Buttons:         10px
Small Elements:  8px
Circular:        50%
```

### Shadows
```typescript
Card Shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

Button Shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
}
```

---

## 📊 Data Flow

### Workout Completion Flow:
```
User taps "Complete Workout"
    ↓
Confirmation dialog shown
    ↓
User confirms
    ↓
workout.completed = true
workout.completedAt = new Date()
    ↓
History entry created
    ↓
State updated in App.tsx
    ↓
UI re-renders
    ↓
Progress bar updates
Completion badge shows
    ↓
Success message shown
    ↓
Navigate back to Weekly Plan
```

### Screen Navigation Flow:
```
App.tsx maintains currentScreen state
    ↓
User action triggers navigation
    ↓
setCurrentScreen('newScreen')
    ↓
Conditional rendering in App.tsx
    ↓
New screen displays
```

---

## 🧪 Testing Each Screen

### Weekly Plan Screen Test:
1. Launch app
2. Verify 5 workout cards display
3. Check progress bar shows 0%
4. Tap History button
5. Tap Summary button
6. Tap on a workout card

### Workout Detail Screen Test:
1. Navigate to workout
2. Wait for video to load
3. Tap play button
4. Verify video plays
5. Tap next exercise
6. Verify exercise changes
7. Tap complete workout
8. Confirm dialog
9. Verify navigation back

### History Screen Test:
1. Complete at least one workout
2. Navigate to history
3. Verify workout appears
4. Check statistics updated
5. Verify date/time shown
6. Tap back button

### Weekly Summary Modal Test:
1. Navigate to weekly plan
2. Tap Summary button
3. Verify modal appears
4. Check statistics accuracy
5. Scroll through workouts
6. Tap close button
7. Verify modal dismisses

---

## 📱 Screen Dimensions

### Layout Considerations:
- **Safe Area Insets**: All screens use SafeAreaView
- **Scroll Areas**: Content is scrollable vertically
- **Fixed Elements**: Headers and footers fixed
- **Responsive**: Adapts to different screen sizes

### Component Heights:
- Video Player: 250px
- Header: ~120-140px
- Workout Card: ~150px
- History Card: Variable (based on exercises)
- Stat Card: ~100px
- Button: 50-60px

---

## 🎯 User Experience Goals

### Each screen achieves:
1. **Clarity**: Clear purpose and content
2. **Simplicity**: Easy to understand and use
3. **Feedback**: Visual response to actions
4. **Efficiency**: Quick access to features
5. **Delight**: Pleasant and engaging UI

### Interaction Patterns:
- **Tap**: Primary action (select, navigate)
- **Scroll**: View more content
- **Swipe**: (Future: dismiss, refresh)
- **Long Press**: (Future: additional options)

---

**Note**: All screens are built with React Native components and styled with StyleSheet for optimal performance.
