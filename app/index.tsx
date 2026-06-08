import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import { restoreSession } from '../src/store/slices/authSlice';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isInitialized } = useAppSelector((s) => s.auth);

  // Logo pulse animation
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  // Loading dots
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    // Staggered entrance animations
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    barWidth.value = withDelay(800, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Loading dots stagger
    dot1.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1,
      true
    );
    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1,
        true
      )
    );
    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1,
        true
      )
    );
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      if (user) {
        router.replace(user.role === 'admin' ? '/(admin)' : '/(employee)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInitialized, user, router]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const barAnimStyle = useAnimatedStyle(() => ({
    width: barWidth.value * (width - 80),
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.container}>
      {/* Logo placeholder — user will provide real logo */}
      <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
        <LinearGradient
          colors={['#FF1F8E', '#8B1FCC', '#FF6B1A', '#FFB800'] as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoPlaceholder}
        >
          <Text style={styles.logoText}>P</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.Text style={[styles.title, titleAnimStyle]}>Polygon Task</Animated.Text>
      <Animated.Text style={[styles.tagline, taglineAnimStyle]}>
        Work smarter, together.
      </Animated.Text>

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>

      {/* Brand color bar at bottom */}
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barWrapper, barAnimStyle]}>
          <LinearGradient
            colors={['#FF1F8E', '#8B1FCC', '#FF2200', '#FF6B1A', '#FFB800'] as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: typography.fonts.extraBold,
    fontSize: 40,
    color: colors.white,
  },
  title: {
    fontFamily: typography.fonts.extraBold,
    fontSize: 28,
    color: colors.white,
  },
  tagline: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing['2xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
  },
  barContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  barWrapper: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  gradientBar: {
    flex: 1,
    borderRadius: 2,
  },
});
