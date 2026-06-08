import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import Avatar from '../../../src/components/ui/Avatar';
import Badge from '../../../src/components/ui/Badge';
import TaskStatusBadge from '../../../src/components/task/TaskStatusBadge';
import Button from '../../../src/components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTaskById, updateTask, deleteTask } from '../../../src/store/slices/tasksSlice';
import { toast } from '../../../src/utils/toast';
import { colors, getPriorityColors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { formatDate, formatRelativeTime, formatPriority, isDueDateOverdue } from '../../../src/utils/formatters';
import type { TaskStatus } from '../../../src/types/task.types';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedTask: task } = useAppSelector((s) => s.tasks);
  const [updatingStatus, setUpdatingStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(Number(id)));
    }
  }, [id, dispatch]);

  const handleStatusUpdate = useCallback(
    async (status: TaskStatus) => {
      if (!task) return;
      setUpdatingStatus(status);
      const result = await dispatch(updateTask({ id: task.id, dto: { status } }));
      if (updateTask.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(`Status updated to ${status.replace('_', ' ')}`);
      } else {
        toast.error('Failed to update status');
      }
      setUpdatingStatus(null);
    },
    [task, dispatch]
  );

  const handleDelete = useCallback(() => {
    if (!task) return;
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(deleteTask(task.id));
            if (deleteTask.fulfilled.match(result)) {
              toast.success('Task deleted');
              router.back();
            } else {
              toast.error('Failed to delete task');
            }
          },
        },
      ]
    );
  }, [task, dispatch, router]);

  if (!task) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Task Detail" height={120}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
              <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </GradientHeader>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const priorityColors = getPriorityColors(task.priority);
  const isOverdue = isDueDateOverdue(task.due_date, task.status);

  return (
    <View style={styles.container}>
      <GradientHeader height={160}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
            <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={2}>{task.title}</Text>
          <Badge
            label={formatPriority(task.priority)}
            backgroundColor="rgba(255,255,255,0.2)"
            textColor={colors.white}
            borderColor="rgba(255,255,255,0.3)"
          />
        </View>
      </GradientHeader>

      <ScrollView
        style={styles.contentCard}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtons}>
          {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((status) => {
            const isSelected = task.status === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  isSelected && styles.statusButtonSelected,
                ]}
                onPress={() => handleStatusUpdate(status)}
                disabled={updatingStatus !== null}
              >
                {isSelected && (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
                    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
                <Text style={[styles.statusButtonText, isSelected && styles.statusButtonTextSelected]}>
                  {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task Details */}
        <View style={styles.detailsSection}>
          {task.assignee && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned to</Text>
              <View style={styles.detailValue}>
                <Avatar name={task.assignee.name} size={24} />
                <Text style={styles.detailText}>{task.assignee.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={[styles.detailText, isOverdue && { color: colors.semantic.error }]}>
              {formatDate(task.due_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailText}>{formatRelativeTime(task.created_at)}</Text>
          </View>

          {task.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        <View style={styles.deleteContainer}>
          <Button
            title="Delete Task"
            variant="danger"
            onPress={handleDelete}
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.semantic.error} strokeWidth={2}>
                <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.white,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -20,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
  },
  contentInner: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  statusButtons: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statusButton: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  statusButtonSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  statusButtonText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
  },
  statusButtonTextSelected: {
    color: colors.white,
  },
  detailsSection: {
    gap: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.neutral[900],
  },
  descriptionSection: {
    marginTop: spacing.md,
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    marginTop: spacing.sm,
  },
  deleteContainer: {
    marginTop: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
  },
});
