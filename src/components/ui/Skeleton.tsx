import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

interface SkeletonProps {
  type: 'stats' | 'card' | 'list';
  count?: number;
}

export default function Skeleton({ type, count = 1 }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {[1, 2, 3].map((i) => (
        <Animated.View key={i} style={[styles.statBox, shimmerStyle]} />
      ))}
    </View>
  );

  const renderCard = () => (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[styles.cardBox, shimmerStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.titleLines}>
              <View style={styles.lineLong} />
              <View style={styles.lineShort} />
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.lineFull} />
            <View style={styles.lineMedium} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  const renderList = () => (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[styles.listBox, shimmerStyle]}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.listInfo}>
            <View style={styles.lineMedium} />
            <View style={styles.lineShort} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  switch (type) {
    case 'stats':
      return renderStats();
    case 'card':
      return renderCard();
    case 'list':
    default:
      return renderList();
  }
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  statBox: {
    width: 130,
    height: 100,
    backgroundColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  listContainer: {
    gap: spacing.md,
  },
  cardBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    padding: spacing.base,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
  },
  titleLines: {
    flex: 1,
    gap: 6,
  },
  lineLong: {
    height: 12,
    width: '60%',
    backgroundColor: colors.neutral[200],
    borderRadius: 6,
  },
  lineShort: {
    height: 8,
    width: '35%',
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
  },
  cardBody: {
    gap: 8,
  },
  lineFull: {
    height: 10,
    width: '100%',
    backgroundColor: colors.neutral[200],
    borderRadius: 5,
  },
  lineMedium: {
    height: 10,
    width: '75%',
    backgroundColor: colors.neutral[200],
    borderRadius: 5,
  },
  listBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listInfo: {
    flex: 1,
    gap: 6,
  },
});
