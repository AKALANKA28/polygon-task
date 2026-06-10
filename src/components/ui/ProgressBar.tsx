import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  gradientColors?: string[];
}

export default function ProgressBar({
  progress,
  height = 8,
  gradientColors,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);
  const { isDark } = useTheme();

  const activeGradient = gradientColors || (isDark ? ['#FF6B1A', '#FFB800'] : colors.primary.gradient);

  useEffect(() => {
    // Keep progress bounded between 0 and 1
    const boundedProgress = Math.min(1, Math.max(0, progress));
    animatedProgress.value = withTiming(boundedProgress, { duration: 600 });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { height, borderRadius: height / 2, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.neutral[200] }]}>
      <Animated.View style={[styles.bar, animatedStyle]}>
        <LinearGradient
          colors={activeGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});
