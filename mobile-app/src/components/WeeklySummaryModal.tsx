import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { WeekPlan } from '../types';

interface WeeklySummaryModalProps {
  visible: boolean;
  weekPlan: WeekPlan;
  onClose: () => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  visible,
  weekPlan,
  onClose,
}) => {
  const completedWorkouts = weekPlan.workouts.filter((w) => w.completed).length;
  const totalWorkouts = weekPlan.workouts.length;
  const completionRate = Math.round((completedWorkouts / totalWorkouts) * 100);

  const totalExercises = weekPlan.workouts.reduce(
    (sum, w) => sum + w.exercises.length,
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Weekly Summary</Text>
          
          <ScrollView style={styles.summaryContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{completedWorkouts}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalWorkouts}</Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalExercises}</Text>
              <Text style={styles.statLabel}>Total Exercises</Text>
            </View>

            <View style={styles.workoutsList}>
              <Text style={styles.workoutsListTitle}>Workouts</Text>
              {weekPlan.workouts.map((workout) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <Text style={styles.workoutDay}>{workout.day}</Text>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text
                    style={[
                      styles.workoutStatus,
                      workout.completed ? styles.completed : styles.pending,
                    ]}
                  >
                    {workout.completed ? '✓ Completed' : 'Pending'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  workoutsList: {
    marginTop: 10,
  },
  workoutsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  workoutItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  workoutDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  workoutStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  completed: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
