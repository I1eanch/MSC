import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WeekPlan, Workout } from '../types';
import { WeeklySummaryModal } from '../components/WeeklySummaryModal';

interface WeeklyPlanScreenProps {
  weekPlan: WeekPlan;
  onWorkoutPress: (workout: Workout) => void;
  onNavigateToHistory: () => void;
}

export const WeeklyPlanScreen: React.FC<WeeklyPlanScreenProps> = ({
  weekPlan,
  onWorkoutPress,
  onNavigateToHistory,
}) => {
  const [showSummary, setShowSummary] = useState(false);

  const completedCount = weekPlan.workouts.filter((w) => w.completed).length;
  const progressPercentage = Math.round(
    (completedCount / weekPlan.workouts.length) * 100
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Week {weekPlan.weekNumber}</Text>
        <Text style={styles.headerSubtitle}>Training Plan</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={onNavigateToHistory}
          >
            <Text style={styles.historyButtonText}>📊 History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => setShowSummary(true)}
          >
            <Text style={styles.summaryButtonText}>📈 Summary</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Weekly Progress</Text>
          <Text style={styles.progressText}>
            {completedCount} / {weekPlan.workouts.length}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.workoutsContainer}
      >
        {weekPlan.workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={[
              styles.workoutCard,
              workout.completed && styles.workoutCardCompleted,
            ]}
            onPress={() => onWorkoutPress(workout)}
          >
            <View style={styles.workoutCardHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDay}>{workout.day}</Text>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
              </View>
              {workout.completed && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.workoutDetails}>
              <Text style={styles.exerciseCount}>
                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
              </Text>
              {workout.completedAt && (
                <Text style={styles.completedDate}>
                  Completed: {new Date(workout.completedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={styles.workoutFooter}>
              <Text style={styles.startButton}>
                {workout.completed ? 'Review' : 'Start'} →
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <WeeklySummaryModal
        visible={showSummary}
        weekPlan={weekPlan}
        onClose={() => setShowSummary(false)}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  historyButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  workoutsContainer: {
    padding: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  workoutCardCompleted: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDetails: {
    marginBottom: 15,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  completedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  workoutFooter: {
    alignItems: 'flex-end',
  },
  startButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
});
