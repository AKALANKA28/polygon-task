import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import Avatar from '../../../src/components/ui/Avatar';
import Badge from '../../../src/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTaskById, updateTask } from '../../../src/store/slices/tasksSlice';
import { toast } from '../../../src/utils/toast';
import { colors, getStatusColors, getPriorityColors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { formatDate, formatRelativeTime, formatPriority, isDueDateOverdue, formatStatus } from '../../../src/utils/formatters';
import type { TaskStatus } from '../../../src/types/task.types';

export default function EmployeeTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedTask: task } = useAppSelector((s) => s.tasks);
  const [updatingStatus, setUpdatingStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchTaskById(Number(id)));
  }, [id, dispatch]);

  const handleStatusUpdate = useCallback(
    async (status: TaskStatus) => {
      if (!task || task.status === status) return;
      setUpdatingStatus(status);
      const result = await dispatch(updateTask({ id: task.id, dto: { status } }));
      if (updateTask.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(`Status updated to ${formatStatus(status)}`);
      } else {
        toast.error('Failed to update status');
      }
      setUpdatingStatus(null);
    },
    [task, dispatch]
  );

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
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </View>
    );
  }

  const priorityColors = getPriorityColors(task.priority);
  const isOverdue = isDueDateOverdue(task.due_date, task.status);

  const statusOptions: { value: TaskStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'in_progress', label: 'In Progress', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'completed', label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader height={160}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
            <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.backText}>My Tasks</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
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
        {/* Status Update */}
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            {statusOptions.map((option) => {
              const isSelected = task.status === option.value;
              const statusColors = getStatusColors(option.value);
              const isUpdating = updatingStatus === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    isSelected
                      ? { backgroundColor: statusColors.dot, borderColor: statusColors.dot }
                      : { borderColor: statusColors.border, backgroundColor: statusColors.bg },
                  ]}
                  onPress={() => handleStatusUpdate(option.value)}
                  disabled={updatingStatus !== null}
                  activeOpacity={0.7}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={isSelected ? colors.white : statusColors.dot} />
                  ) : (
                    <>
                      {isSelected && (
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={isSelected ? colors.white : statusColors.text} strokeWidth={1.8}>
                        <Path d={option.icon} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: isSelected ? colors.white : statusColors.text },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Details */}
        <View style={styles.detailsSection}>
          {task.creator && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned by</Text>
              <View style={styles.detailValue}>
                <Avatar name={task.creator.name} size={24} />
                <Text style={styles.detailText}>{task.creator.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <View style={styles.detailValue}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isOverdue ? colors.semantic.error : colors.neutral[500]} strokeWidth={1.8}>
                <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.detailText, isOverdue && { color: colors.semantic.error }]}>
                {formatDate(task.due_date)}
              </Text>
            </View>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.white },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginTop: spacing.md, gap: spacing.md,
  },
  headerTitle: { flex: 1, fontFamily: typography.fonts.bold, fontSize: typography.sizes.xl, color: colors.white },
  contentCard: {
    flex: 1, backgroundColor: colors.white, marginTop: -20,
    borderTopLeftRadius: radius['2xl'], borderTopRightRadius: radius['2xl'],
  },
  contentInner: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md,
    color: colors.neutral[900], marginBottom: spacing.md,
  },
  statusButtons: { gap: spacing.sm, marginBottom: spacing.xl },
  statusButton: {
    height: 52, borderRadius: radius.md, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  statusButtonText: { fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.base },
  detailsSection: { gap: spacing.base },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.neutral[500] },
  detailValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailText: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.neutral[900] },
  descriptionSection: { marginTop: spacing.md },
  description: {
    fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.neutral[700],
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed, marginTop: spacing.sm,
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
