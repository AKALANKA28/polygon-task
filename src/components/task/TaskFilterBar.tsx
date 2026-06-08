import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';
import type { TaskStatus, TaskPriority } from '../../types/task.types';

interface TaskFilterBarProps {
  activeStatus: 'all' | TaskStatus;
  activePriority: 'all' | TaskPriority;
  onStatusChange: (status: 'all' | TaskStatus) => void;
  onPriorityChange: (priority: 'all' | TaskPriority) => void;
}

export default function TaskFilterBar({
  activeStatus,
  activePriority,
  onStatusChange,
  onPriorityChange,
}: TaskFilterBarProps) {
  const statusOptions: Array<{ value: 'all' | TaskStatus; label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions: Array<{ value: 'all' | TaskPriority; label: string }> = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <View style={styles.container}>
      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {statusOptions.map((opt) => {
          const isSelected = activeStatus === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
              onPress={() => onStatusChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Priority Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {priorityOptions.map((opt) => {
          const isSelected = activePriority === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
              onPress={() => onPriorityChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  scrollView: {
    marginHorizontal: -spacing.base,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs + 2,
  },
  pill: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pillSelected: {
    backgroundColor: colors.brand.magenta,
    borderColor: colors.brand.magenta,
  },
  pillUnselected: {
    backgroundColor: colors.white,
    borderColor: colors.surface.border,
  },
  pillText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs + 2,
  },
  pillTextSelected: {
    color: colors.white,
    fontFamily: typography.fonts.semiBold,
  },
  pillTextUnselected: {
    color: colors.neutral[600],
  },
});
