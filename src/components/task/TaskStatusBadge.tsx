import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getStatusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';
import type { TaskStatus } from '../../types/task.types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const statusColors = getStatusColors(status);
  
  // Format text (e.g., in_progress -> In Progress)
  const formattedStatus = status === 'in_progress'
    ? 'In Progress'
    : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: statusColors.bg,
          borderColor: statusColors.border,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: statusColors.dot }]} />
      <Text style={[styles.text, { color: statusColors.text }]}>
        {formattedStatus}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs + 2,
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs + 1,
  },
});
