import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, getStatusColors, getPriorityColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatDate, formatPriority } from '../../utils/formatters';
import type { Task } from '../../types/task.types';

import Svg, { Path } from 'react-native-svg';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  index?: number;
}

export default function TaskCard({ task, onPress, index = 0 }: TaskCardProps) {
  const statusColors = useMemo(() => getStatusColors(task.status), [task.status]);
  const priorityColors = useMemo(() => getPriorityColors(task.priority), [task.priority]);

  const formattedDueDate = useMemo(() => formatDate(task.due_date), [task.due_date]);
  const formattedPriorityLabel = useMemo(() => formatPriority(task.priority), [task.priority]);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 80, 500)).duration(400)}
      style={styles.animatedWrapper}
    >
      <TouchableOpacity
        onPress={() => onPress(task)}
        style={[styles.card, shadows.sm]}
        activeOpacity={0.8}
      >
        {/* Status stripe on the left */}
        <View style={[styles.statusStripe, { backgroundColor: statusColors.dot }]} />

        <View style={styles.content}>
          {/* Header Row: Title & Priority */}
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {task.title}
            </Text>
            <Badge
              label={formattedPriorityLabel}
              backgroundColor={priorityColors.bg}
              textColor={priorityColors.text}
              borderColor={priorityColors.border}
            />
          </View>

          {/* Body: Optional Description */}
          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          {/* Footer Row: Due Date & Assignee */}
          <View style={styles.footerRow}>
            <View style={styles.dueDateWrapper}>
              <SvgCalendarIcon color={colors.neutral[500]} />
              <Text style={styles.dueDateText}>
                {formattedDueDate}
              </Text>
            </View>

            {task.assignee ? (
              <View style={styles.assigneeWrapper}>
                <Text style={styles.assigneeName} numberOfLines={1}>
                  {task.assignee.name}
                </Text>
                <Avatar name={task.assignee.name} size={24} />
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Inline calendar icon
const SvgCalendarIcon = ({ color }: { color: string }) => (
  <View style={styles.calendarIcon}>
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
      <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  animatedWrapper: {
    marginBottom: spacing.base,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  statusStripe: {
    width: 5,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.base + 1,
    color: colors.neutral[900],
    marginRight: spacing.md,
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dueDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: spacing.xs,
  },
  dueDateText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  assigneeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  assigneeName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    maxWidth: 100,
  },
});
