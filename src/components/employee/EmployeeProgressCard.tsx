import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import type { Employee } from '../../types/employee.types';
import { useTheme } from '../../theme/ThemeContext';

interface EmployeeProgressCardProps {
  employee: Employee;
  onLongPress?: () => void;
}

export default function EmployeeProgressCard({ employee, onLongPress }: EmployeeProgressCardProps) {
  const { isDark, themeColors } = useTheme();
  
  const taskCount = employee.taskCount || 0;
  const completedCount = employee.completedCount || 0;
  const pendingCount = employee.pendingCount || 0;
  const inProgressCount = employee.inProgressCount || 0;

  const completionRate = useMemo(() => {
    if (taskCount === 0) return 0;
    return completedCount / taskCount;
  }, [completedCount, taskCount]);

  const formattedPercentage = useMemo(() => {
    return `${Math.round(completionRate * 100)}%`;
  }, [completionRate]);

  return (
    <TouchableOpacity
      activeOpacity={onLongPress ? 0.8 : 1}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }, shadows.sm]}
    >
      {/* Employee Info Header */}
      <View style={styles.header}>
        <Avatar name={employee.name} size={48} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
            {employee.name}
          </Text>
          <Text style={[styles.department, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {employee.department || 'General'} • {employee.email}
          </Text>
        </View>
      </View>

      {/* Task Counts Summary Row */}
      <View style={[styles.statsRow, { backgroundColor: isDark ? colors.surfaceDark.background : colors.surface.background }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{taskCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Assigned</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft, { borderLeftColor: themeColors.border }]}>
          <Text style={[styles.statValue, { color: colors.status.pending.text }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pending</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft, { borderLeftColor: themeColors.border }]}>
          <Text style={[styles.statValue, { color: colors.status.inProgress.text }]}>{inProgressCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>In Progress</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft, { borderLeftColor: themeColors.border }]}>
          <Text style={[styles.statValue, { color: colors.status.completed.text }]}>{completedCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Completion Rate</Text>
          <Text style={styles.progressPercentage}>{formattedPercentage}</Text>
        </View>
        <ProgressBar progress={completionRate} height={6} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.base + 2,
  },
  department: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  progressLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs + 1,
  },
  progressPercentage: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xs + 2,
    color: colors.brand.purple,
  },
});
