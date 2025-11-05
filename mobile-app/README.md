# Training Mobile UI

A React Native mobile application for managing weekly workout plans with integrated video playback support.

## Features

### 🏋️ Weekly Plan Overview
- View all workouts for the week
- Track progress with visual progress bars
- See completion status for each workout
- Quick access to workout history and weekly summary

### 🎥 Workout Detail with Video Player
- Integrated video player using Expo AV
- Smooth video streaming with loading indicators
- Background playback support for audio
- Navigate between exercises within a workout
- View exercise instructions and duration
- Complete workout functionality

### ✅ Completion Button
- Mark workouts as complete
- Completion confirmation dialog
- Updates progress in real-time
- Adds completed workouts to history

### 📊 History View
- View all completed workouts
- Chronologically sorted history
- Statistics: total workouts and exercises
- Detailed exercise information for each workout

### 📈 Weekly Summary Modal
- Completion rate percentage
- Visual statistics cards
- Overview of all workouts with status
- Quick access to weekly progress

## Technical Implementation

### Video Playback
- **Expo AV**: Used for video streaming and playback
- **Background Audio**: Configured audio mode for background playback support
- **Smooth Streaming**: Optimized video loading with error handling and retry functionality
- **Play/Pause Controls**: Custom controls for better UX

### State Management
- React hooks (useState) for local state
- Workout completion updates progress immediately
- History automatically updated when workouts are completed

### UI/UX
- **Responsive Design**: Mobile-optimized layouts
- **SafeAreaView**: Proper handling of device safe areas
- **Smooth Navigation**: Simple screen transitions
- **Visual Feedback**: Loading indicators, completion badges, and status colors

## Installation

```bash
cd mobile-app
npm install
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (requires macOS)
npm run ios

# Run on web
npm run web
```

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── WeeklyPlanScreen.tsx      # Weekly workout overview
│   │   ├── WorkoutDetailScreen.tsx   # Workout with video player
│   │   └── HistoryScreen.tsx         # Workout history
│   ├── components/
│   │   ├── VideoPlayer.tsx           # Video player with Expo AV
│   │   └── WeeklySummaryModal.tsx    # Weekly stats modal
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── data/
│   │   └── mockData.ts               # Sample workout data
│   └── utils/                        # Utility functions (future)
├── App.tsx                            # Main app entry point
└── package.json
```

## Dependencies

- **expo**: ~54.0.22
- **expo-av**: ^16.0.7 - Video and audio playback
- **react-native**: 0.81.5
- **react**: 19.1.0
- **typescript**: ~5.9.2

## Key Features Implementation

### Background Playback Support
The app uses Expo AV with proper audio mode configuration:
```typescript
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

### Video Streaming
- Uses public sample videos for demonstration
- Implements loading states and error handling
- Retry functionality for failed video loads
- Playback status tracking

### Progress Tracking
- Real-time progress updates
- Visual progress bars
- Completion badges
- Statistics calculations

## Future Enhancements

- User authentication
- Backend integration for data persistence
- Social features (share workouts)
- Custom workout creation
- Advanced video player controls (seek, speed)
- Offline video downloads
- Push notifications for workout reminders
