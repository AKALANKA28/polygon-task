import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import GradientHeader from '../../src/components/ui/GradientHeader';
import TaskCard from '../../src/components/task/TaskCard';
import FeaturedTaskCard from '../../src/components/task/FeaturedTaskCard';
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
import { isDueToday, getGreeting } from '../../src/utils/formatters';
import type { Task, TaskStatus, TaskPriority } from '../../src/types/task.types';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeContext';
import { normalize } from '../../src/utils/responsive';

const getChipColors = (status: 'pending' | 'in_progress' | 'completed', isDark: boolean) => {
  if (isDark) {
    return {
      pending: {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: '#FBBF24',
        label: '#F59E0B',
      },
      in_progress: {
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.3)',
        text: '#38BDF8',
        label: '#0ea5e9',
      },
      completed: {
        bg: 'rgba(168, 85, 247, 0.12)',
        border: 'rgba(168, 85, 247, 0.3)',
        text: '#C084FC',
        label: '#a855f7',
      },
    }[status];
  }
  return {
    pending: {
      bg: '#FFF8EE',
      border: 'rgba(245, 158, 11, 0.2)',
      text: '#C27803',
      label: '#92400E',
    },
    in_progress: {
      bg: '#EEF6FF',
      border: 'rgba(56, 189, 248, 0.2)',
      text: '#0284C7',
      label: '#0369A1',
    },
    completed: {
      bg: '#F8F2FF',
      border: 'rgba(168, 85, 247, 0.2)',
      text: '#7C3AED',
      label: '#6D28D9',
    },
  }[status];
};

const StatChip: React.FC<{ count: number; label: string; status: 'pending' | 'in_progress' | 'completed'; isDark: boolean }> = React.memo(({ count, label, status, isDark }) => {
  const chipColors = getChipColors(status, isDark);
  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(300)}
      style={[
        statStyles.chip,
        {
          backgroundColor: chipColors.bg,
          borderColor: chipColors.border,
          borderWidth: 1.2,
        }
      ]}
    >
      <Text style={[statStyles.chipCount, { color: chipColors.text }]}>{count}</Text>
      <Text style={[statStyles.chipLabel, { color: chipColors.label }]}>{label}</Text>
    </Animated.View>
  );
});
StatChip.displayName = 'StatChip';

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { isLoading, searchQuery, filterStatus, filterPriority } = useAppSelector((s) => s.tasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark, toggleTheme, themeColors } = useTheme();

  const styles = getStyles(isDark, themeColors);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const stats = useMemo(() => {
    return {
      pending: filteredTasks.filter((t) => t.status === 'pending').length,
      inProgress: filteredTasks.filter((t) => t.status === 'in_progress').length,
      completed: filteredTasks.filter((t) => t.status === 'completed').length,
    };
  }, [filteredTasks]);

  // Featured Task: First active (not completed) task
  const featuredTask = useMemo(() => {
    return filteredTasks.find((t) => t.status !== 'completed') || null;
  }, [filteredTasks]);

  // Due Today tasks (excluding featured task to avoid duplicate rendering)
  const todayTasks = useMemo(() => {
    const list = filteredTasks.filter((t) => isDueToday(t.due_date));
    if (!featuredTask) return list;
    return list.filter((t) => t.id !== featuredTask.id);
  }, [filteredTasks, featuredTask]);

  const todayCompletedCount = useMemo(() => {
    const list = filteredTasks.filter((t) => isDueToday(t.due_date));
    return list.filter((t) => t.status === 'completed').length;
  }, [filteredTasks]);

  const todayTotalCount = useMemo(() => {
    return filteredTasks.filter((t) => isDueToday(t.due_date)).length;
  }, [filteredTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  }, [dispatch]);

  const lastPressedTime = React.useRef(0);

  const handleTaskPress = useCallback(
    (task: Task) => {
      const now = Date.now();
      if (now - lastPressedTime.current < 800) return;
      lastPressedTime.current = now;
      router.navigate(`/(employee)/tasks/${task.id}`);
    },
    [router]
  );

  const greeting = useMemo(() => getGreeting(), []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />
        }
      >
        <GradientHeader
          height={120}
          usePrimaryGradient={true}
          leftContent={
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.nameText}>{user?.name || 'Employee'}</Text>
            </View>
          }
          rightContent={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7} style={styles.themeButton}>
                <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
                  {isDark ? (
                    <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </Svg>
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.content}>
          {/* Stats Strip */}
          <View style={styles.statsRow}>
            <StatChip count={stats.pending} label="Pending" status="pending" isDark={isDark} />
            <StatChip count={stats.inProgress} label="In Progress" status="in_progress" isDark={isDark} />
            <StatChip count={stats.completed} label="Completed" status="completed" isDark={isDark} />
          </View>

          {/* Active Task (Featured) */}
          {featuredTask && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Task</Text>
              </View>
              <FeaturedTaskCard
                task={featuredTask}
                onPress={handleTaskPress}
              />
            </View>
          )}

          {/* Today Tasks */}
          {todayTotalCount > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today Tasks</Text>
                <Text style={styles.tasksDoneCount}>
                  {todayCompletedCount}/{todayTotalCount} done
                </Text>
              </View>
              {todayTasks.length > 0 ? (
                todayTasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
                ))
              ) : (
                <EmptyState title="No pending tasks for today" subtitle="All today's tasks completed!" />
              )}
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
              filteredTasks.map((task, index) => {
                // Do not repeat the featured task in the all tasks list
                if (featuredTask && task.id === featuredTask.id) return null;
                return (
                  <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
                );
              })
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
    borderRadius: radius.lg,
  },
  chipCount: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
  },
  chipLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs + 1,
    marginTop: 2,
  },
});

const getStyles = (isDark: boolean, themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: themeColors.text,
  },
  greetingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  nameText: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(22),
    color: colors.white,
    marginTop: normalize(2),
  },
  themeButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
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
    color: themeColors.text,
    marginBottom: 0,
  },
  tasksDoneCount: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: themeColors.textSecondary,
  },
  todayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  todayText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  filterContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
