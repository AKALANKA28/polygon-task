import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../../../src/components/ui/Header';
import Avatar from '../../../src/components/ui/Avatar';
import Badge from '../../../src/components/ui/Badge';
import ProgressBar from '../../../src/components/ui/ProgressBar';
import TaskCard from '../../../src/components/task/TaskCard';
import EmptyState from '../../../src/components/ui/EmptyState';

import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchEmployees } from '../../../src/store/slices/employeesSlice';
import { fetchTasks } from '../../../src/store/slices/tasksSlice';
import { colors } from '../../../src/theme/colors';
import { spacing, radius, shadows } from '../../../src/theme/spacing';
import { typography } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/ThemeContext';
import { normalize } from '../../../src/utils/responsive';
import type { Task } from '../../../src/types/task.types';

const { width: screenWidth } = Dimensions.get('window');

interface StatCardProps {
  icon: 'clipboard' | 'clock' | 'zap' | 'check';
  count: number;
  label: string;
  isDark: boolean;
  themeColors: any;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ icon, count, label, isDark, themeColors }) => {
  const iconPaths: Record<string, string> = {
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    zap: 'M13 10V3L4 14h7v7l9-11h-7z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const themeMap = {
    clipboard: {
      gradient: ['#FF1F8E', '#8B1FCC'],
    },
    clock: {
      gradient: ['#FF8F00', '#FF1F8E'],
    },
    zap: {
      gradient: ['#8B1FCC', '#00C4FF'],
    },
    check: {
      gradient: ['#00C4FF', '#00FF87'],
    },
  };

  const activeTheme = themeMap[icon];

  return (
    <View style={[
      styles.statCard,
      shadows.sm,
      {
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        borderWidth: isDark ? 1 : 0.5,
      }
    ]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[styles.statCardLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.statCount, { color: isDark ? colors.white : colors.neutral[900] }]}>{count}</Text>
      </View>
      <LinearGradient
        colors={activeTheme.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statIconCircle}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
          <Path d={iconPaths[icon]} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </LinearGradient>
    </View>
  );
});
StatCard.displayName = 'StatCard';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: employees, isLoading: loadingEmployees } = useAppSelector((s) => s.employees);
  const { items: allTasks, isLoading: loadingTasks } = useAppSelector((s) => s.tasks);
  const [refreshing, setRefreshing] = useState(false);

  const { isDark, themeColors } = useTheme();

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchTasks());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchEmployees()), dispatch(fetchTasks())]);
    setRefreshing(false);
  }, [dispatch]);

  const employee = useMemo(() => {
    return employees.find((e) => Number(e.id) === Number(id));
  }, [employees, id]);

  const employeeTasks = useMemo(() => {
    return allTasks.filter((task) =>
      task.assignees?.some((assignee) => Number(assignee.id) === Number(id)) ||
      Number(task.assigned_to) === Number(id)
    );
  }, [allTasks, id]);

  const taskCount = employee?.taskCount || 0;
  const completedCount = employee?.completedCount || 0;
  const pendingCount = employee?.pendingCount || 0;
  const inProgressCount = employee?.inProgressCount || 0;

  const completionRate = useMemo(() => {
    if (taskCount === 0) return 0;
    return completedCount / taskCount;
  }, [completedCount, taskCount]);

  const formattedPercentage = useMemo(() => {
    return `${Math.round(completionRate * 100)}%`;
  }, [completionRate]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push(`/(admin)/tasks/${task.id}`);
    },
    [router]
  );

  if ((loadingEmployees || loadingTasks) && !employee) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header title="Employee Details" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header title="Employee Details" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: themeColors.textSecondary, fontFamily: typography.fonts.medium }}>
            Employee not found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={employee.name}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Avatar name={employee.name} size={64} />
            <View style={styles.profileMeta}>
              <Text style={[styles.profileName, { color: themeColors.text }]}>{employee.name}</Text>
              <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>{employee.email}</Text>
              {employee.department && (
                <View style={{ marginTop: spacing.xs, alignItems: 'flex-start' }}>
                  <Badge
                    label={employee.department}
                    backgroundColor={isDark ? colors.neutral[800] : colors.neutral[100]}
                    textColor={themeColors.text}
                    size="sm"
                  />
                </View>
              )}
            </View>
          </View>
          {employee.phone && (
            <View style={styles.phoneRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
                <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.phoneText, { color: themeColors.text }]}>{employee.phone}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard icon="clipboard" count={taskCount} label="Total Tasks" isDark={isDark} themeColors={themeColors} />
            <StatCard icon="clock" count={pendingCount} label="Pending" isDark={isDark} themeColors={themeColors} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="zap" count={inProgressCount} label="In Progress" isDark={isDark} themeColors={themeColors} />
            <StatCard icon="check" count={completedCount} label="Completed" isDark={isDark} themeColors={themeColors} />
          </View>
        </View>

        {/* Completion Progress Rate */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Task Completion Rate</Text>
            <Text style={styles.progressPercentage}>{formattedPercentage}</Text>
          </View>
          <ProgressBar progress={completionRate} height={8} />
        </View>

        {/* Tasks Assigned Section */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Assigned Tasks</Text>
        
        <View style={styles.taskList}>
          {employeeTasks.length === 0 ? (
            <EmptyState title="No tasks assigned" subtitle="This employee does not have any tasks assigned" />
          ) : (
            employeeTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={handleTaskPress}
                index={index}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  profileSection: {
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMeta: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg + 2,
  },
  profileEmail: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  phoneText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
  },
  statsGrid: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    height: normalize(84),
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCardLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs + 1,
    opacity: 0.8,
  },
  statCount: {
    fontFamily: typography.fonts.extraBold,
    fontSize: normalize(24),
    marginTop: 2,
  },
  statIconCircle: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  progressPercentage: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.base,
    color: colors.brand.purple,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  taskList: {
    gap: spacing.sm,
  },
});
