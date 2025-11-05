# Training Mobile UI - Quick Start Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your mobile device (optional, for testing on real device)

### Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### Running the App

#### Start Development Server
```bash
npm start
```

This will start the Expo development server and show a QR code.

#### Run on Different Platforms

**Android:**
```bash
npm run android
```
Requires Android Studio and Android emulator or connected Android device.

**iOS (macOS only):**
```bash
npm run ios
```
Requires Xcode and iOS simulator or connected iOS device.

**Web:**
```bash
npm run web
```
Opens the app in your default web browser.

#### Using Expo Go App (Easiest Method)
1. Install Expo Go from App Store (iOS) or Google Play (Android)
2. Run `npm start` in the terminal
3. Scan the QR code with your phone:
   - iOS: Use Camera app
   - Android: Use Expo Go app
4. App will load on your device

## 📱 App Features

### Main Screens

1. **Weekly Plan Screen** (Home)
   - View all workouts for the week
   - See your progress
   - Access History and Summary

2. **Workout Detail Screen**
   - Watch exercise videos
   - Navigate between exercises
   - Read instructions
   - Complete workouts

3. **History Screen**
   - View completed workouts
   - See statistics
   - Review past exercises

4. **Weekly Summary Modal**
   - Check weekly progress
   - View completion rate
   - See all workout statuses

## 🎯 Testing the App

### Recommended Test Flow:

1. **Start at Weekly Plan**
   - Observe 5 workouts for the week
   - Note the progress bar at 0%

2. **Select a Workout**
   - Tap on "Upper Body Strength" (Monday)
   - Watch the video load and stream

3. **Interact with Video**
   - Press play/pause button
   - Let video play for a few seconds

4. **Navigate Exercises**
   - Use "Next" button to see next exercise
   - Use "Previous" button to go back

5. **Complete Workout**
   - Tap "Complete Workout" button
   - Confirm in the dialog
   - See success message

6. **Check Progress**
   - Return to Weekly Plan
   - Note progress bar updated (20%)
   - See completed badge on workout

7. **View History**
   - Tap "History" button
   - See your completed workout
   - Check the statistics

8. **View Summary**
   - Go back to Weekly Plan
   - Tap "Summary" button
   - Review weekly statistics

## 🎥 Video Playback Features

- **Smooth Streaming**: Videos load with proper buffering
- **Background Playback**: Audio continues when app is backgrounded
- **Error Handling**: Retry button if video fails to load
- **Loading States**: Visual feedback during video loading
- **Custom Controls**: Play/Pause button overlay

## 🔧 Troubleshooting

### Video Not Playing
- Check internet connection
- Try the retry button
- Videos use public URLs (Google Cloud Storage samples)

### App Won't Start
```bash
# Clear Expo cache
npx expo start -c
```

### TypeScript Errors
```bash
# Run type check
npx tsc --noEmit
```

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

## 📂 Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # Main app screens
│   ├── components/       # Reusable components
│   ├── types/           # TypeScript types
│   └── data/            # Mock data
├── App.tsx              # Main entry point
└── package.json         # Dependencies
```

## 🛠️ Development

### Adding New Workouts
Edit `src/data/mockData.ts` to add more workouts or exercises.

### Customizing Styles
All styles are defined using StyleSheet.create() in each component.

### Adding Features
- State management is in App.tsx
- Add new screens in src/screens/
- Add new components in src/components/

## 📝 Notes

- App uses React Native with Expo
- TypeScript for type safety
- Expo AV for video playback
- Mock data for demonstration
- No backend required for testing

## 🎨 UI/UX Features

- **Responsive Design**: Works on all screen sizes
- **Safe Areas**: Handles notches and system UI
- **Visual Feedback**: Loading states, animations
- **Intuitive Navigation**: Clear back buttons and flow
- **Color Coding**:
  - Blue: Active/Primary actions
  - Green: Completed states
  - Orange: Pending states
  - Red: Errors

## 📊 Key Metrics

The app tracks:
- Weekly completion rate
- Number of workouts completed
- Total exercises completed
- Individual workout completion dates

## 🚧 Future Enhancements

Potential features to add:
- User authentication
- Backend API integration
- Custom workout creation
- Social sharing
- Workout reminders
- Offline video support
- Advanced analytics
