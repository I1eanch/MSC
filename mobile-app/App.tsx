import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { WeeklyPlanScreen } from './src/screens/WeeklyPlanScreen';
import { WorkoutDetailScreen } from './src/screens/WorkoutDetailScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { mockWeekPlan, mockHistory } from './src/data/mockData';
import { Workout, WorkoutHistory, WeekPlan } from './src/types';

type Screen = 'weeklyPlan' | 'workoutDetail' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('weeklyPlan');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(mockWeekPlan);
  const [history, setHistory] = useState<WorkoutHistory[]>(mockHistory);

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workoutDetail');
  };

  const handleCompleteWorkout = (workoutId: string) => {
    const completedAt = new Date();
    
    setWeekPlan((prevPlan) => ({
      ...prevPlan,
      workouts: prevPlan.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, completed: true, completedAt }
          : w
      ),
    }));

    const completedWorkout = weekPlan.workouts.find((w) => w.id === workoutId);
    if (completedWorkout) {
      const newHistoryEntry: WorkoutHistory = {
        id: `history-${Date.now()}`,
        workoutId: completedWorkout.id,
        workoutTitle: completedWorkout.title,
        completedAt,
        exercises: completedWorkout.exercises,
      };
      setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
    }
  };

  const handleNavigateToHistory = () => {
    setCurrentScreen('history');
  };

  const handleBackToWeeklyPlan = () => {
    setCurrentScreen('weeklyPlan');
    setSelectedWorkout(null);
  };

  return (
    <>
      <StatusBar style="light" />
      {currentScreen === 'weeklyPlan' && (
        <WeeklyPlanScreen
          weekPlan={weekPlan}
          onWorkoutPress={handleWorkoutPress}
          onNavigateToHistory={handleNavigateToHistory}
        />
      )}
      {currentScreen === 'workoutDetail' && selectedWorkout && (
        <WorkoutDetailScreen
          workout={selectedWorkout}
          onComplete={handleCompleteWorkout}
          onBack={handleBackToWeeklyPlan}
        />
      )}
      {currentScreen === 'history' && (
        <HistoryScreen
          history={history}
          onBack={handleBackToWeeklyPlan}
        />
      )}
    </>
  );
}
