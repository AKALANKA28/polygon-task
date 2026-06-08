import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import GradientHeader from '../../src/components/ui/GradientHeader';
import Avatar from '../../src/components/ui/Avatar';
import TaskCard from '../../src/components/task/TaskCard';
import TaskSearchBar from '../../src/components/task/TaskSearchBar';
import TaskFilterBar from '../../src/components/task/TaskFilterBar';
import Skeleton from '../../src/components/ui/Skeleton';
import EmptyState from '../../src/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import {
  fetchTasks,
  setSearchQuery,
  setFilterStatus,
  setFilterPriority,
  selectFilteredTasks,
} from '../../src/store/slices/tasksSlice';
import { colors, getStatusColors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radius } from '../../src/theme/spacing';
import { isDueToday } from '../../src/utils/formatters';
import type { Task, TaskStatus, TaskPriority } from '../../src/types/task.types';

const StatChip: React.FC<{ count: number; label: string; color: string }> = React.memo(({ count, label, color }) => (
  <Animated.View entering={FadeIn.delay(200).duration(300)} style={[statStyles.chip, { borderColor: color + '40' }]}>
    <Text style={[statStyles.chipCount, { color }]}>{count}</Text>
    <Text style={statStyles.chipLabel}>{label}</Text>
  </Animated.View>
));
StatChip.displayName = 'StatChip';

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { isLoading, searchQuery, filterStatus, filterPriority } = useAppSelector((s) => s.tasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const stats = useMemo(() => {
    const items = useAppSelector.length ? filteredTasks : [];
    return {
      pending: filteredTasks.filter((t) => t.status === 'pending').length,
      inProgress: filteredTasks.filter((t) => t.status === 'in_progress').length,
      completed: filteredTasks.filter((t) => t.status === 'completed').length,
    };
  }, [filteredTasks]);

  const todayTasks = useMemo(
    () => filteredTasks.filter((t) => isDueToday(t.due_date)),
    [filteredTasks]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  }, [dispatch]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push(`/(employee)/tasks/${task.id}`);
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />
        }
      >
        <GradientHeader
          height={180}
          leftContent={
            <View>
              <Text style={styles.headerTitle}>My Tasks</Text>
            </View>
          }
          rightContent={<Avatar name={user?.name || 'User'} size={44} />}
        />

        <View style={styles.content}>
          {/* Stats Strip */}
          <View style={styles.statsRow}>
            <StatChip count={stats.pending} label="Pending" color={getStatusColors('pending').dot} />
            <StatChip count={stats.inProgress} label="In Progress" color={getStatusColors('in_progress').dot} />
            <StatChip count={stats.completed} label="Completed" color={getStatusColors('completed').dot} />
          </View>

          {/* Today's tasks */}
          {todayTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Due Today</Text>
                <View style={styles.todayChip}>
                  <Text style={styles.todayText}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
              {todayTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
              ))}
            </View>
          )}

          {/* All Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Tasks</Text>
            <TaskSearchBar value={searchQuery} onChangeText={(text) => dispatch(setSearchQuery(text))} />
            <View style={styles.filterContainer}>
              <TaskFilterBar
                activeStatus={filterStatus}
                activePriority={filterPriority}
                onStatusChange={(s) => dispatch(setFilterStatus(s))}
                onPriorityChange={(p) => dispatch(setFilterPriority(p))}
              />
            </View>

            {isLoading ? (
              <Skeleton type="card" count={3} />
            ) : filteredTasks.length === 0 ? (
              <EmptyState title="No tasks found" subtitle="You don't have any tasks matching these filters" />
            ) : (
              filteredTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
              ))
            )}
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const statStyles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  chipCount: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
  },
  chipLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs + 1,
    color: colors.neutral[500],
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'],
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  todayChip: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  todayText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  filterContainer: {
    marginTop: spacing.md,
  },
});
