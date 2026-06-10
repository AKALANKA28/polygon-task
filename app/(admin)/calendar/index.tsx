import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTasks } from '../../../src/store/slices/tasksSlice';
import { useTheme } from '../../../src/theme/ThemeContext';
import CalendarScheduleView from '../../../src/components/calendar/CalendarScheduleView';
import type { Task } from '../../../src/types/task.types';

export default function AdminCalendarScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeColors } = useTheme();
  const { items: tasks } = useAppSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const lastPressedTime = React.useRef(0);

  const handleTaskPress = (task: Task) => {
    const now = Date.now();
    if (now - lastPressedTime.current < 800) return;
    lastPressedTime.current = now;
    router.navigate(`/(admin)/tasks/${task.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CalendarScheduleView tasks={tasks} onTaskPress={handleTaskPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
