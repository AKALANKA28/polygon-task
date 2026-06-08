import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import type { Employee } from '../../types/employee.types';

interface EmployeeProgressCardProps {
  employee: Employee;
}

export default function EmployeeProgressCard({ employee }: EmployeeProgressCardProps) {
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
    <View style={[styles.card, shadows.sm]}>
      {/* Employee Info Header */}
      <View style={styles.header}>
        <Avatar name={employee.name} size={48} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {employee.name}
          </Text>
          <Text style={styles.department} numberOfLines={1}>
            {employee.department || 'General'} • {employee.email}
          </Text>
        </View>
      </View>

      {/* Task Counts Summary Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.neutral[900] }]}>{taskCount}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft]}>
          <Text style={[styles.statValue, { color: colors.status.pending.text }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft]}>
          <Text style={[styles.statValue, { color: colors.status.inProgress.text }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={[styles.statItem, styles.borderLeft]}>
          <Text style={[styles.statValue, { color: colors.status.completed.text }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Completion Rate</Text>
          <Text style={styles.progressPercentage}>{formattedPercentage}</Text>
        </View>
        <ProgressBar progress={completionRate} height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surface.border,
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
    color: colors.neutral[900],
  },
  department: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface.background,
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
    borderLeftColor: colors.neutral[200],
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
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
    color: colors.neutral[500],
  },
  progressPercentage: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xs + 2,
    color: colors.brand.purple,
  },
});
