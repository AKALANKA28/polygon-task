import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/formatters';
import type { Task } from '../../types/task.types';
import { useTheme } from '../../theme/ThemeContext';
import { normalize } from '../../utils/responsive';

interface FeaturedTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const SvgCalendarIcon = ({ color }: { color: string }) => (
  <Svg width={normalize(14)} height={normalize(14)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FeaturedTaskCard = React.memo(function FeaturedTaskCard({ task, onPress }: FeaturedTaskCardProps) {
  const { isDark, themeColors } = useTheme();

  const progressPercent = useMemo(() => {
    if (task.status === 'completed') return 100;
    if (task.status === 'in_progress') return 50;
    return 20;
  }, [task.status]);

  const priorityColors = useMemo(() => {
    const map = {
      low: { text: isDark ? '#4ADE80' : '#166534' },
      medium: { text: isDark ? '#FBBF24' : '#92400E' },
      high: { text: isDark ? '#F87171' : '#9F1239' },
    };
    return map[task.priority];
  }, [task.priority, isDark]);

  const accentColor = priorityColors.text;

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      style={[
        styles.featuredCard,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        },
      ]}
      activeOpacity={0.85}
    >
      <View style={styles.featuredTopRow}>
        <View style={[styles.featuredPriorityPill, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
          <Text style={[styles.featuredPriorityText, { color: priorityColors.text }]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Text>
        </View>
        <View style={styles.featuredMoreButton}>
          <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2.5}>
            <Path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
            <Path d="M19 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
            <Path d="M5 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
          </Svg>
        </View>
      </View>

      <Text style={[styles.featuredTitle, { color: themeColors.text }]} numberOfLines={2}>
        {task.title}
      </Text>

      {task.description ? (
        <Text style={[styles.featuredDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.brand.orange }]} />
        </View>
        <Text style={[styles.progressText, { color: themeColors.text }]}>{progressPercent}%</Text>
      </View>

      <View style={[styles.featuredDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

      <View style={styles.featuredFooter}>
        {task.assignees && task.assignees.length > 0 ? (
          <View style={styles.avatarStack}>
            <AvatarStack assignees={task.assignees} size={normalize(26)} />
          </View>
        ) : task.assignee ? (
          <View style={styles.avatarStack}>
            <Avatar name={task.assignee.name} size={normalize(26)} />
          </View>
        ) : (
          <View />
        )}
        
        <View style={styles.featuredDateWrapper}>
          <SvgCalendarIcon color={themeColors.textSecondary} />
          <Text style={[styles.featuredDateText, { color: themeColors.textSecondary }]}>
            {formatDate(task.due_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default FeaturedTaskCard;

const AvatarStack = ({ assignees, size = 26 }: { assignees: any[], size?: number }) => {
  if (!assignees || assignees.length === 0) return null;
  const visible = assignees.slice(0, 3);
  const remaining = assignees.length - visible.length;
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((item, idx) => (
        <View key={item.id} style={{ marginLeft: idx === 0 ? 0 : normalize(-8), zIndex: 10 - idx }}>
          <Avatar name={item.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View style={{
          marginLeft: normalize(-8),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.neutral[600],
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.white,
          zIndex: 0,
        }}>
          <Text style={{ color: colors.white, fontSize: size * 0.4, fontFamily: typography.fonts.bold }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    borderRadius: normalize(20),
    borderWidth: 1.2,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featuredPriorityPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  featuredPriorityText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs,
  },
  featuredMoreButton: {
    padding: spacing.xs,
  },
  featuredTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg + 2,
    marginBottom: spacing.xs,
    lineHeight: normalize(28),
  },
  featuredDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    lineHeight: normalize(20),
    marginBottom: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBarTrack: {
    flex: 1,
    height: normalize(6),
    borderRadius: normalize(3),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: normalize(3),
  },
  progressText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs + 1,
    width: normalize(32),
    textAlign: 'right',
  },
  featuredDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featuredDateText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
});
