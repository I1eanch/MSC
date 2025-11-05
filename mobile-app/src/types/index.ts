export interface Exercise {
  id: string;
  name: string;
  videoUrl: string;
  duration: number;
  description: string;
}

export interface Workout {
  id: string;
  title: string;
  day: string;
  exercises: Exercise[];
  completed: boolean;
  completedAt?: Date;
}

export interface WeekPlan {
  id: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  workouts: Workout[];
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutTitle: string;
  completedAt: Date;
  exercises: Exercise[];
}

export type RootStackParamList = {
  WeeklyPlan: undefined;
  WorkoutDetail: { workout: Workout };
  History: undefined;
};
