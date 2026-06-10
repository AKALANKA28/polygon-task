import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { normalize } from '../../utils/responsive';
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
  const { isDark, themeColors } = useTheme();

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

  const getPillStyle = (isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: isDark ? '#FFFFFF' : '#171614',
        border: isDark ? '#FFFFFF' : '#171614',
        text: isDark ? '#171614' : '#FFFFFF',
        font: typography.fonts.semiBold,
      };
    }
    return {
      bg: themeColors.card,
      border: themeColors.border,
      text: themeColors.textSecondary,
      font: typography.fonts.medium,
    };
  };

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
          const stylesObj = getPillStyle(isSelected);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pill,
                {
                  backgroundColor: stylesObj.bg,
                  borderColor: stylesObj.border,
                },
              ]}
              onPress={() => onStatusChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: stylesObj.text,
                    fontFamily: stylesObj.font,
                  },
                ]}
              >
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
          const stylesObj = getPillStyle(isSelected);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pill,
                {
                  backgroundColor: stylesObj.bg,
                  borderColor: stylesObj.border,
                },
              ]}
              onPress={() => onPriorityChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: stylesObj.text,
                    fontFamily: stylesObj.font,
                  },
                ]}
              >
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
    height: normalize(34),
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
  },
  pillText: {
    fontSize: typography.sizes.xs + 2,
  },
});
