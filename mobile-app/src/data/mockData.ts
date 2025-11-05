import { WeekPlan, WorkoutHistory } from '../types';

export const mockWeekPlan: WeekPlan = {
  id: 'week-1',
  weekNumber: 1,
  startDate: new Date(2024, 0, 1),
  endDate: new Date(2024, 0, 7),
  workouts: [
    {
      id: 'workout-1',
      title: 'Upper Body Strength',
      day: 'Monday',
      completed: false,
      exercises: [
        {
          id: 'ex-1',
          name: 'Push-ups',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 180,
          description: 'Standard push-ups with proper form. Keep your body straight and lower until chest nearly touches the ground.',
        },
        {
          id: 'ex-2',
          name: 'Dumbbell Rows',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: 240,
          description: 'Pull the dumbbell towards your hip while keeping your back straight.',
        },
      ],
    },
    {
      id: 'workout-2',
      title: 'Lower Body Power',
      day: 'Tuesday',
      completed: false,
      exercises: [
        {
          id: 'ex-3',
          name: 'Squats',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 200,
          description: 'Keep your feet shoulder-width apart and lower down as if sitting in a chair.',
        },
      ],
    },
    {
      id: 'workout-3',
      title: 'Core & Flexibility',
      day: 'Wednesday',
      completed: false,
      exercises: [
        {
          id: 'ex-4',
          name: 'Plank',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 120,
          description: 'Hold a plank position with your body in a straight line.',
        },
      ],
    },
    {
      id: 'workout-4',
      title: 'Cardio Blast',
      day: 'Thursday',
      completed: false,
      exercises: [
        {
          id: 'ex-5',
          name: 'Burpees',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: 150,
          description: 'Full body exercise combining a squat, plank, and jump.',
        },
      ],
    },
    {
      id: 'workout-5',
      title: 'Full Body Circuit',
      day: 'Friday',
      completed: false,
      exercises: [
        {
          id: 'ex-6',
          name: 'Mountain Climbers',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 180,
          description: 'Alternate bringing knees to chest in a plank position.',
        },
      ],
    },
  ],
};

export const mockHistory: WorkoutHistory[] = [
  {
    id: 'history-1',
    workoutId: 'workout-0',
    workoutTitle: 'Morning Yoga',
    completedAt: new Date(2023, 11, 28),
    exercises: [
      {
        id: 'ex-h1',
        name: 'Sun Salutations',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        duration: 300,
        description: 'Flow through sun salutations.',
      },
    ],
  },
  {
    id: 'history-2',
    workoutId: 'workout-00',
    workoutTitle: 'Evening Stretch',
    completedAt: new Date(2023, 11, 27),
    exercises: [
      {
        id: 'ex-h2',
        name: 'Hamstring Stretch',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        duration: 180,
        description: 'Gentle hamstring stretches.',
      },
    ],
  },
];
