import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import GradientHeader from '../../src/components/ui/GradientHeader';
import Avatar from '../../src/components/ui/Avatar';
import TaskCard from '../../src/components/task/TaskCard';
import Skeleton from '../../src/components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchTasks, fetchTaskStats } from '../../src/store/slices/tasksSlice';
import { logout } from '../../src/store/slices/authSlice';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { getGreeting } from '../../src/utils/formatters';
import { COUNT_UP_DURATION_MS } from '../../src/utils/constants';
import type { Task } from '../../src/types/task.types';

const { width: screenWidth } = Dimensions.get('window');

import { useTheme } from '../../src/theme/ThemeContext';

const AnimatedNumber: React.FC<{ value: number; delay?: number; isDark: boolean }> = ({ value, delay = 0, isDark }) => {
  const animVal = useSharedValue(0);

  useEffect(() => {
    animVal.value = withDelay(delay, withTiming(value, { duration: COUNT_UP_DURATION_MS, easing: Easing.out(Easing.cubic) }));
  }, [value, delay, animVal]);

  const textColor = isDark ? colors.white : colors.neutral[900];

  return (
    <Animated.Text
      entering={FadeIn.delay(delay).duration(400)}
      style={[statStyles.count, { color: textColor }]}
    >
      {value}
    </Animated.Text>
  );
};

interface StatCardProps {
  icon: string;
  gradientColors: [string, string] | string;
  count: number;
  label: string;
  delay: number;
  isDark: boolean;
  themeColors: any;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ icon, gradientColors, count, label, delay, isDark, themeColors }) => {
  const iconPaths: Record<string, string> = {
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    zap: 'M13 10V3L4 14h7v7l9-11h-7z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const isGradient = Array.isArray(gradientColors);

  return (
    <Animated.View entering={SlideInUp.delay(delay).duration(400).springify()}>
      <View style={[statStyles.card, shadows.sm, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: isDark ? 1 : 0 }]}>
        {isGradient ? (
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={statStyles.iconCircle}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
              <Path d={iconPaths[icon]} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </LinearGradient>
        ) : (
          <View style={[statStyles.iconCircle, { backgroundColor: gradientColors as string }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
              <Path d={iconPaths[icon]} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
        <AnimatedNumber value={count} delay={delay} isDark={isDark} />
        <Text style={[statStyles.label, { color: themeColors.textSecondary }]}>{label}</Text>
      </View>
    </Animated.View>
  );
});
StatCard.displayName = 'StatCard';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { items: tasks, stats, isLoading } = useAppSelector((s) => s.tasks);
  const [refreshing, setRefreshing] = React.useState(false);
  const { isDark, toggleTheme, themeColors } = useTheme();

  const styles = getStyles(isDark, themeColors);

  // FAB animation
  const fabTranslateY = useSharedValue(80);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, [dispatch, router]);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskStats());
    fabTranslateY.value = withDelay(600, withSpring(0, { damping: 12, stiffness: 120 }));
  }, [dispatch, fabTranslateY]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fabTranslateY.value }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchTasks()), dispatch(fetchTaskStats())]);
    setRefreshing(false);
  }, [dispatch]);

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push(`/(admin)/tasks/${task.id}`);
    },
    [router]
  );

  const greeting = useMemo(() => getGreeting(), []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        {/* Gradient Header */}
        <GradientHeader
          height={200}
          leftContent={
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.nameText}>{user?.name || 'Admin'}</Text>
              <Text style={styles.headerSubtitle}>Manage your team's tasks</Text>
            </View>
          }
          rightContent={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7} style={styles.themeButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
                  {isDark ? (
                    <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
                <Avatar name={user?.name || 'Admin'} size={44} />
              </TouchableOpacity>
            </View>
          }
        />

        {/* Stats Row */}
        <View style={styles.content}>
          {isLoading && !stats ? (
            <Skeleton type="stats" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
              style={styles.statsContainer}
            >
              <StatCard icon="clipboard" gradientColors={['#FF1F8E', '#8B1FCC']} count={stats?.total || 0} label="Total Tasks" delay={100} isDark={isDark} themeColors={themeColors} />
              <StatCard icon="clock" gradientColors="#FFB800" count={stats?.pending || 0} label="Pending" delay={200} isDark={isDark} themeColors={themeColors} />
              <StatCard icon="zap" gradientColors="#FF1F8E" count={stats?.inProgress || 0} label="In Progress" delay={300} isDark={isDark} themeColors={themeColors} />
              <StatCard icon="check" gradientColors="#8B1FCC" count={stats?.completed || 0} label="Completed" delay={400} isDark={isDark} themeColors={themeColors} />
            </ScrollView>
          )}

          {/* Recent Tasks */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/tasks')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Skeleton type="card" count={3} />
          ) : (
            recentTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity onPress={() => router.push('/(admin)/tasks/create')} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.primary.gradient as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabButton}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    width: 130,
    height: 100,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  count: {
    fontFamily: typography.fonts.extraBold,
    fontSize: 26,
  },
  label: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs + 1,
    marginTop: 2,
  },
});

const getStyles = (isDark: boolean, themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.base,
  },
  greetingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.white,
  },
  nameText: {
    fontFamily: typography.fonts.bold,
    fontSize: 22,
    color: colors.white,
    marginTop: 2,
  },
  headerSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  themeButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.base,
  },
  statsRow: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    color: themeColors.text,
  },
  seeAll: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm + 1,
    color: colors.primary.DEFAULT,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    ...shadows.lg,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
