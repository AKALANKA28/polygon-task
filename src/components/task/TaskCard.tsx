import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, getStatusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import { formatDate, formatPriority } from '../../utils/formatters';
import type { Task } from '../../types/task.types';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  index?: number;
}

export default function TaskCard({ task, onPress, index = 0 }: TaskCardProps) {
  const { isDark, themeColors } = useTheme();

  const priorityColors = useMemo(() => {
    const map = {
      low: {
        bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(240, 253, 244, 0.9)',
        text: isDark ? '#4ADE80' : '#166534',
        border: isDark ? 'rgba(34, 197, 94, 0.25)' : '#BBF7D0',
      },
      medium: {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 251, 235, 0.9)',
        text: isDark ? '#FBBF24' : '#92400E',
        border: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A',
      },
      high: {
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 241, 242, 0.9)',
        text: isDark ? '#F87171' : '#9F1239',
        border: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECDD3',
      },
    };
    return map[task.priority];
  }, [task.priority, isDark]);

  const formattedDueDate = useMemo(() => formatDate(task.due_date), [task.due_date]);
  const formattedPriorityLabel = useMemo(() => formatPriority(task.priority), [task.priority]);
  const isCompleted = task.status === 'completed';

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 80, 500)).duration(400)}
      style={styles.animatedWrapper}
    >
      <TouchableOpacity
        onPress={() => onPress(task)}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
          shadows.sm,
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {/* Top Row: Priority & Options */}
          <View style={styles.topRow}>
            <View style={[styles.priorityPill, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
              <Text style={[styles.priorityText, { color: priorityColors.text }]}>
                {formattedPriorityLabel}
              </Text>
            </View>
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2.5}>
                <Path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                <Path d="M19 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                <Path d="M5 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isCompleted ? themeColors.textSecondary : themeColors.text },
              isCompleted && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Description */}
          {task.description ? (
            <Text
              style={[
                styles.description,
                { color: themeColors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}

          {/* Divider line */}
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          {/* Footer Row */}
          <View style={styles.footerRow}>
            <View style={styles.dueDateWrapper}>
              <SvgCalendarIcon color={isCompleted ? colors.semantic.success : themeColors.textSecondary} />
              <Text style={[styles.dueDateText, { color: themeColors.textSecondary }]}>
                {formattedDueDate}
              </Text>
            </View>

            {task.assignee ? (
              <View style={styles.assigneeWrapper}>
                <Avatar name={task.assignee.name} size={24} />
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const SvgCalendarIcon = ({ color }: { color: string }) => (
  <View style={styles.calendarIcon}>
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  animatedWrapper: {
    marginBottom: spacing.base,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priorityPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  priorityText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moreButton: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md + 1,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: spacing.xs + 1,
  },
  dueDateText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  assigneeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
