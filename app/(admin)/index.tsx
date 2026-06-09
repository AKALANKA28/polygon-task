import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
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
import { useRouter } from 'expo-router';
import { normalize } from '../../src/utils/responsive';
import Svg, { Path } from 'react-native-svg';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

import GradientHeader from '../../src/components/ui/GradientHeader';
import TaskCard from '../../src/components/task/TaskCard';
import FeaturedTaskCard from '../../src/components/task/FeaturedTaskCard';
import Skeleton from '../../src/components/ui/Skeleton';
import EmptyState from '../../src/components/ui/EmptyState';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchTasks, fetchTaskStats, createTask } from '../../src/store/slices/tasksSlice';
import { fetchEmployees } from '../../src/store/slices/employeesSlice';
import { logout } from '../../src/store/slices/authSlice';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { getGreeting, formatDate } from '../../src/utils/formatters';
import { COUNT_UP_DURATION_MS } from '../../src/utils/constants';
import { toast } from '../../src/utils/toast';
import { useTheme } from '../../src/theme/ThemeContext';
import type { Task } from '../../src/types/task.types';
import type { Employee } from '../../src/types/employee.types';

const { width: screenWidth } = Dimensions.get('window');

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
  icon: 'clipboard' | 'clock' | 'zap' | 'check';
  count: number;
  label: string;
  delay: number;
  isDark: boolean;
  themeColors: any;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ icon, count, label, delay, isDark, themeColors }) => {
  const iconPaths: Record<string, string> = {
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    zap: 'M13 10V3L4 14h7v7l9-11h-7z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const themeMap = {
    clipboard: {
      color: isDark ? '#C084FC' : '#8B1FCC',
      bg: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(139, 31, 204, 0.08)',
    },
    clock: {
      color: isDark ? '#FBBF24' : '#D97706',
      bg: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
    },
    zap: {
      color: isDark ? '#38BDF8' : '#0284C7',
      bg: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.08)',
    },
    check: {
      color: isDark ? '#34D399' : '#10B981',
      bg: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.08)',
    },
  };

  const activeTheme = themeMap[icon];

  return (
    <Animated.View entering={SlideInUp.delay(delay).duration(400).springify()} style={{ flex: 1 }}>
      <View style={[
        statStyles.card,
        shadows.sm,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderWidth: isDark ? 1 : 0.5,
        }
      ]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[statStyles.label, { color: themeColors.textSecondary }]} numberOfLines={1}>{label}</Text>
          <AnimatedNumber value={count} delay={delay} isDark={isDark} />
        </View>
        <View style={[statStyles.iconCircle, { backgroundColor: activeTheme.bg }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTheme.color} strokeWidth={2}>
            <Path d={iconPaths[icon]} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
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
  const { items: employees } = useAppSelector((s) => s.employees);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark, toggleTheme, themeColors } = useTheme();

  const styles = getStyles(isDark, themeColors);

  // Bottom Sheets State
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  // Create Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 86400000)); // Default tomorrow
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector Overlay modals inside sheet
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  
  // Custom Inline Calendar Date Tracker
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // FAB animation
  const fabTranslateY = useSharedValue(80);

  const handleLogout = useCallback(() => {
    setShowLogoutSheet(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setShowLogoutSheet(false);
    await dispatch(logout());
    router.replace('/(auth)/login');
  }, [dispatch, router]);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskStats());
    dispatch(fetchEmployees());
    fabTranslateY.value = withDelay(600, withSpring(0, { damping: 12, stiffness: 120 }));
  }, [dispatch, fabTranslateY]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fabTranslateY.value }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchTasks()), dispatch(fetchTaskStats()), dispatch(fetchEmployees())]);
    setRefreshing(false);
  }, [dispatch]);

  const featuredTask = useMemo(() => tasks[0] || null, [tasks]);
  const otherTasks = useMemo(() => tasks.slice(1, 5), [tasks]);

  const completedCount = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks]);
  const totalCount = useMemo(() => tasks.length, [tasks]);

  const lastPressedTime = React.useRef(0);

  const handleTaskPress = useCallback(
    (task: Task) => {
      const now = Date.now();
      if (now - lastPressedTime.current < 800) return;
      lastPressedTime.current = now;
      router.navigate(`/(admin)/tasks/${task.id}`);
    },
    [router]
  );

  // Create Task Submission
  const handleCreateTask = useCallback(async () => {
    if (!taskTitle.trim()) {
      toast.error('Task Title is required');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      toast.error('Please assign to at least one employee');
      return;
    }

    setIsSubmitting(true);
    try {
      // Append project to description if present
      const fullDescription = taskProject.trim()
        ? `[Project: ${taskProject.trim()}] ${taskDesc.trim()}`
        : taskDesc.trim();

      // Formatted due date string (YYYY-MM-DD)
      const formattedDueDateStr = selectedDate.toISOString().split('T')[0];

      const result = await dispatch(createTask({
        title: taskTitle.trim(),
        description: fullDescription || undefined,
        priority: taskPriority,
        assigned_to: selectedEmployeeIds,
        due_date: formattedDueDateStr,
      }));

      if (createTask.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Task created successfully!');
        
        // Reset states and close modal
        setTaskTitle('');
        setTaskDesc('');
        setTaskProject('');
        setTaskPriority('medium');
        setSelectedDate(new Date(Date.now() + 86400000));
        setSelectedEmployeeIds([]);
        Keyboard.dismiss();
        setTimeout(() => {
          setShowCreateSheet(false);
        }, 250);
        dispatch(fetchTaskStats());
      } else {
        toast.error('Failed to create task');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [taskTitle, taskDesc, taskProject, taskPriority, selectedDate, selectedEmployeeIds, dispatch]);

  const greeting = useMemo(() => getGreeting(), []);

  // Calendar Helpers
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [calendarDate]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const selectedEmployees = useMemo(() => {
    return employees.filter(e => selectedEmployeeIds.includes(e.id));
  }, [employees, selectedEmployeeIds]);

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId) 
        : [...prev, employeeId]
    );
  };

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
        {/* Compact Adaptive Header */}
        <GradientHeader
          height={120}
          usePrimaryGradient={false}
          leftContent={
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.nameText}>{user?.name || 'Admin'}</Text>
            </View>
          }
          rightContent={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7} style={styles.themeButton}>
                <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={themeColors.text} strokeWidth={2}>
                  {isDark ? (
                    <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.themeButton}>
                <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={themeColors.text} strokeWidth={2}>
                  <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Stats Row */}
        <View style={styles.content}>
          {isLoading && !stats ? (
            <Skeleton type="stats" />
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard icon="clipboard" count={stats?.total || 0} label="Total Tasks" delay={100} isDark={isDark} themeColors={themeColors} />
                <StatCard icon="clock" count={stats?.pending || 0} label="Pending" delay={200} isDark={isDark} themeColors={themeColors} />
              </View>
              <View style={styles.statsRow}>
                <StatCard icon="zap" count={stats?.inProgress || 0} label="In Progress" delay={300} isDark={isDark} themeColors={themeColors} />
                <StatCard icon="check" count={stats?.completed || 0} label="Completed" delay={400} isDark={isDark} themeColors={themeColors} />
              </View>
            </View>
          )}

          {/* Projects Carousel Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/tasks')}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Skeleton type="card" count={1} />
          ) : featuredTask ? (
            <FeaturedTaskCard
              task={featuredTask}
              onPress={handleTaskPress}
            />
          ) : null}

          {/* Today Tasks List Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today Tasks</Text>
            <Text style={styles.tasksDoneCount}>
              {completedCount}/{totalCount} done
            </Text>
          </View>

          {isLoading ? (
            <Skeleton type="card" count={3} />
          ) : otherTasks.length > 0 ? (
            otherTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onPress={handleTaskPress} index={index} />
            ))
          ) : (
            <EmptyState title="No tasks for today" subtitle="Enjoy your day!" />
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB - Premium Rounded Square */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity onPress={() => setShowCreateSheet(true)} activeOpacity={0.9}>
          <View style={[styles.fabButton, { backgroundColor: isDark ? colors.white : colors.neutral[900] }]}>
            <Text style={[styles.fabIcon, { color: isDark ? colors.black : colors.white }]}>+</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Logout bottom sheet */}
      <Modal
        isVisible={showLogoutSheet}
        onBackdropPress={() => setShowLogoutSheet(false)}
        backdropOpacity={0.5}
        style={styles.bottomSheet}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.bottomSheetTitle}>Sign Out</Text>
          <Text style={styles.bottomSheetMessage}>Are you sure you want to sign out of your account?</Text>
          <View style={styles.bottomSheetButtons}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowLogoutSheet(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Sign Out" variant="danger" onPress={confirmLogout} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Task Bottom Sheet */}
      <Modal
        isVisible={showCreateSheet}
        onBackdropPress={() => {
          if (!isSubmitting) {
            Keyboard.dismiss();
            setTimeout(() => {
              setShowCreateSheet(false);
            }, 250);
          }
        }}
        backdropOpacity={0.5}
        style={styles.bottomSheet}
        avoidKeyboard={false}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={[styles.bottomSheetContent, { paddingHorizontal: 0 }]}>
          <View style={styles.dragHandle} />
          <Text style={[styles.bottomSheetTitle, { marginBottom: 12 }]}>Create Task</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <View style={styles.sheetInputRow}>
              <TextInput
                style={styles.sheetTextInputTitle}
                placeholder="Task Title"
                placeholderTextColor={isDark ? colors.neutral[600] : colors.neutral[400]}
                value={taskTitle}
                onChangeText={setTaskTitle}
                maxLength={200}
              />
            </View>

            {/* Description Row Container */}
            <View style={styles.rowContainer}>
              <View style={styles.rowPlusCircle}>
                <Text style={styles.rowPlusText}>+</Text>
              </View>
              <TextInput
                style={styles.rowTextInput}
                placeholder="Add Description"
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                value={taskDesc}
                onChangeText={setTaskDesc}
                multiline
              />
            </View>

            {/* Date and Priority row */}
            <View style={styles.gridRow}>
              {/* Date Column */}
              <TouchableOpacity
                style={styles.gridCell}
                activeOpacity={0.8}
                onPress={() => {
                  setCalendarDate(new Date());
                  setShowCalendarModal(true);
                }}
              >
                <View style={styles.gridCellIconWrapper}>
                  <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
                    <Path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.gridCellTextWrapper}>
                  <Text style={styles.gridCellLabel}>Date</Text>
                  <Text style={styles.gridCellValue} numberOfLines={1}>
                    {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </TouchableOpacity>
 
              {/* Priority Column */}
              <View style={styles.gridCell}>
                <View style={styles.gridCellIconWrapper}>
                  <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
                    <Path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gridCellLabel}>Priority</Text>
                  <View style={styles.prioritySelectorInline}>
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityOptionInline,
                          taskPriority === p && { backgroundColor: colors.brand.purple }
                        ]}
                        onPress={() => setTaskPriority(p)}
                      >
                        <Text style={[
                          styles.priorityOptionTextInline,
                          { color: taskPriority === p ? colors.white : themeColors.text }
                        ]}>
                          {p.charAt(0).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Add Project Row Container */}
            <View style={styles.rowContainer}>
              <View style={styles.rowPlusCircle}>
                <Text style={styles.rowPlusText}>+</Text>
              </View>
              <TextInput
                style={styles.rowTextInput}
                placeholder="Add Project"
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                value={taskProject}
                onChangeText={setTaskProject}
              />
            </View>

            {/* Add People Row Container */}
            <TouchableOpacity
              style={styles.rowContainer}
              activeOpacity={0.8}
              onPress={() => setShowEmployeeModal(true)}
            >
              <View style={styles.rowPlusCircle}>
                <Text style={styles.rowPlusText}>+</Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.rowPlaceholderText}>
                  {selectedEmployeeIds.length > 0
                    ? `${selectedEmployeeIds.length} People Assigned`
                    : 'Add People'}
                </Text>
              </View>
              <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
                <Path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Selected Assignees List */}
            {selectedEmployees.length > 0 && (
              <View style={styles.assigneeListContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                  {selectedEmployees.map((emp) => (
                    <View key={emp.id} style={styles.assigneeChip}>
                      <Avatar name={emp.name} size={20} />
                      <Text style={styles.assigneeChipText} numberOfLines={1}>{emp.name.split(' ')[0]}</Text>
                      <TouchableOpacity
                        onPress={() => toggleEmployeeSelection(emp.id)}
                        style={styles.removeAssigneeButton}
                      >
                        <Text style={{ color: colors.semantic.error, fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.bottomSheetButtons}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => {
                      setShowCreateSheet(false);
                    }, 250);
                  }}
                  disabled={isSubmitting}
                />
              </View>
              <View style={{ flex: 1 }}>
                {isSubmitting ? (
                  <View style={styles.submitLoader}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                ) : (
                  <Button
                    title="Create"
                    onPress={handleCreateTask}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker Modal (Custom Calendar Overlay) */}
      <Modal
        isVisible={showCalendarModal}
        onBackdropPress={() => setShowCalendarModal(false)}
        backdropOpacity={0.4}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.centerModal}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.calendarModalContent}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarNavBtn}>
              <Text style={{ fontSize: 18, color: colors.brand.purple }}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.calendarMonthTitle}>
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavBtn}>
              <Text style={{ fontSize: 18, color: colors.brand.purple }}>▶</Text>
            </TouchableOpacity>
          </View>
          
          {/* Days headers */}
          <View style={styles.calendarWeekRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <Text key={d} style={styles.calendarDayHeader}>{d}</Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.calendarDaysGrid}>
            {calendarDays.map((day, idx) => {
              const dateVal = day ? new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day) : null;
              const isSelected = dateVal ? isSameDay(dateVal, selectedDate) : false;
              
              return (
                <TouchableOpacity
                  key={idx}
                  disabled={day === null}
                  style={[
                    styles.calendarDayCell,
                    isSelected && styles.calendarDayCellSelected,
                  ]}
                  onPress={() => {
                    if (dateVal) {
                      setSelectedDate(dateVal);
                      setShowCalendarModal(false);
                    }
                  }}
                >
                  <Text style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextSelected,
                    day === null && { opacity: 0 }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button title="Close" variant="ghost" size="sm" onPress={() => setShowCalendarModal(false)} />
        </View>
      </Modal>

      {/* Employee Picker Modal (Multi-Select) */}
      <Modal
        isVisible={showEmployeeModal}
        onBackdropPress={() => setShowEmployeeModal(false)}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.bottomSheet}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.dragHandle} />
          <View style={styles.modalHeaderRow}>
            <Text style={styles.bottomSheetTitle}>Assign Employees</Text>
            <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
              <Text style={{ color: colors.brand.purple, fontFamily: typography.fonts.semiBold }}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={employees}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 300, marginBottom: spacing.md }}
            renderItem={({ item }) => {
              const isSelected = selectedEmployeeIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={styles.employeeSelectRow}
                  activeOpacity={0.7}
                  onPress={() => toggleEmployeeSelection(item.id)}
                >
                  <Avatar name={item.name} size={36} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.employeeSelectName, { color: themeColors.text }]}>{item.name}</Text>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>{item.department || 'Employee'}</Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && { backgroundColor: colors.brand.purple, borderColor: colors.brand.purple }
                  ]}>
                    {isSelected && (
                      <Text style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    height: normalize(84),
    borderRadius: normalize(16),
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconCircle: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: typography.fonts.extraBold,
    fontSize: normalize(26),
    marginTop: normalize(2),
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: normalize(12),
    opacity: 0.8,
  },
});

const getStyles = (isDark: boolean, themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.xs,
  },
  greetingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: themeColors.textSecondary,
  },
  nameText: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(22),
    color: themeColors.text,
    marginTop: normalize(2),
  },
  themeButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
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
  tasksDoneCount: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: themeColors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: normalize(30),
    right: normalize(24),
    ...shadows.lg,
  },
  fabButton: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    marginTop: normalize(-2),
  },
  // Bottom Sheet Custom Styles
  bottomSheet: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetContent: {
    backgroundColor: themeColors.card,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  dragHandle: {
    width: normalize(40),
    height: normalize(5),
    borderRadius: normalize(3),
    backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300],
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  bottomSheetTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(18),
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  bottomSheetMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: normalize(14),
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  // Form input layout styles matching mockup
  sheetInputRow: {
    marginBottom: spacing.md,
  },
  sheetTextInputTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(20),
    color: themeColors.text,
    paddingVertical: spacing.xs,
  },
  rowContainer: {
    height: normalize(52),
    backgroundColor: isDark ? colors.neutral[900] : '#F3F4F6',
    borderRadius: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  rowPlusCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: isDark ? colors.neutral[800] : colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
  },
  rowPlusText: {
    color: themeColors.textSecondary,
    fontSize: normalize(14),
    fontFamily: typography.fonts.bold,
    marginTop: normalize(-1.5),
  },
  rowTextInput: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: normalize(14),
    color: themeColors.text,
  },
  rowPlaceholderText: {
    fontFamily: typography.fonts.medium,
    fontSize: normalize(14),
    color: themeColors.textSecondary,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
    height: normalize(52),
    backgroundColor: isDark ? colors.neutral[900] : '#F3F4F6',
    borderRadius: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridCellIconWrapper: {
    width: normalize(24),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellTextWrapper: {
    flex: 1,
  },
  gridCellLabel: {
    fontSize: normalize(10),
    fontFamily: typography.fonts.regular,
    color: themeColors.textSecondary,
  },
  gridCellValue: {
    fontSize: normalize(13),
    fontFamily: typography.fonts.bold,
    color: themeColors.text,
  },
  prioritySelectorInline: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 2,
  },
  priorityOptionInline: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(6),
    borderWidth: 0.5,
    borderColor: themeColors.border,
  },
  priorityOptionTextInline: {
    fontSize: normalize(9),
    fontFamily: typography.fonts.bold,
  },
  submitLoader: {
    height: normalize(48),
    backgroundColor: colors.brand.purple,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Custom Calendar Modal Styles
  centerModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  calendarModalContent: {
    width: screenWidth * 0.85,
    backgroundColor: themeColors.card,
    borderRadius: normalize(24),
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarMonthTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(16),
    color: themeColors.text,
  },
  calendarNavBtn: {
    padding: spacing.xs,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  calendarDayHeader: {
    fontFamily: typography.fonts.bold,
    fontSize: normalize(12),
    color: themeColors.textSecondary,
    width: normalize(32),
    textAlign: 'center',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  calendarDayCell: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: colors.brand.purple,
  },
  calendarDayText: {
    fontFamily: typography.fonts.medium,
    fontSize: normalize(13),
    color: themeColors.text,
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontFamily: typography.fonts.bold,
  },
  // Multi-select Employee Styles
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  employeeSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: themeColors.border,
  },
  employeeSelectName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: normalize(14),
  },
  checkbox: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(6),
    borderWidth: 1.5,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeListContainer: {
    marginVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.neutral[900] : '#E5E7EB',
    borderRadius: normalize(12),
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(4),
    gap: normalize(6),
  },
  assigneeChipText: {
    fontSize: normalize(12),
    fontFamily: typography.fonts.medium,
    color: themeColors.text,
  },
  removeAssigneeButton: {
    padding: 2,
  },
});
