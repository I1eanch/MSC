import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Workout, Exercise } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

interface WorkoutDetailScreenProps {
  workout: Workout;
  onComplete: (workoutId: string) => void;
  onBack: () => void;
}

export const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({
  workout,
  onComplete,
  onBack,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = workout.exercises[currentExerciseIndex];

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleCompleteWorkout = () => {
    Alert.alert(
      'Complete Workout',
      'Are you sure you want to mark this workout as complete?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: () => {
            onComplete(workout.id);
            Alert.alert(
              'Success!',
              'Workout completed successfully!',
              [{ text: 'OK', onPress: onBack }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerDay}>{workout.day}</Text>
          <Text style={styles.headerTitle}>{workout.title}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseCount}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        </View>

        <VideoPlayer
          videoUrl={currentExercise.videoUrl}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              console.log('Video playback status:', status);
            }
          }}
        />

        <View style={styles.exerciseInfo}>
          <View style={styles.durationCard}>
            <Text style={styles.durationLabel}>Duration</Text>
            <Text style={styles.durationValue}>
              {Math.floor(currentExercise.duration / 60)}:
              {(currentExercise.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Instructions</Text>
            <Text style={styles.descriptionText}>
              {currentExercise.description}
            </Text>
          </View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentExerciseIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                currentExerciseIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentExerciseIndex === workout.exercises.length - 1 &&
                styles.navButtonDisabled,
            ]}
            onPress={handleNextExercise}
            disabled={currentExerciseIndex === workout.exercises.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                currentExerciseIndex === workout.exercises.length - 1 &&
                  styles.navButtonTextDisabled,
              ]}
            >
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exercisesList}>
          <Text style={styles.exercisesListTitle}>All Exercises</Text>
          {workout.exercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseItem,
                index === currentExerciseIndex && styles.exerciseItemActive,
              ]}
              onPress={() => setCurrentExerciseIndex(index)}
            >
              <Text
                style={[
                  styles.exerciseItemNumber,
                  index === currentExerciseIndex &&
                    styles.exerciseItemNumberActive,
                ]}
              >
                {index + 1}
              </Text>
              <Text
                style={[
                  styles.exerciseItemName,
                  index === currentExerciseIndex &&
                    styles.exerciseItemNameActive,
                ]}
              >
                {exercise.name}
              </Text>
              <Text
                style={[
                  styles.exerciseItemDuration,
                  index === currentExerciseIndex &&
                    styles.exerciseItemDurationActive,
                ]}
              >
                {Math.floor(exercise.duration / 60)}:
                {(exercise.duration % 60).toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {!workout.completed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteWorkout}
          >
            <Text style={styles.completeButtonText}>
              ✓ Complete Workout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {workout.completed && (
        <View style={styles.footer}>
          <View style={styles.completedIndicator}>
            <Text style={styles.completedIndicatorText}>
              ✓ Workout Completed
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    marginTop: 5,
  },
  headerDay: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  exerciseHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseInfo: {
    padding: 15,
  },
  durationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  durationValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  navButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  exercisesList: {
    padding: 15,
  },
  exercisesListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseItemActive: {
    backgroundColor: '#2196F3',
  },
  exerciseItemNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 30,
  },
  exerciseItemNumberActive: {
    backgroundColor: '#fff',
    color: '#2196F3',
  },
  exerciseItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  exerciseItemNameActive: {
    color: '#fff',
  },
  exerciseItemDuration: {
    fontSize: 14,
    color: '#666',
  },
  exerciseItemDurationActive: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedIndicator: {
    backgroundColor: '#e8f5e9',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completedIndicatorText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
