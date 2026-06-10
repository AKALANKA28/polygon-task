import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
// Cast FlashList to any because of React 19 / SDK 55 strict type definitions mismatch
const TypedFlashList = FlashList as any;
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../../src/components/ui/Header';
import TaskCard from '../../../src/components/task/TaskCard';
import TaskSearchBar from '../../../src/components/task/TaskSearchBar';
import TaskFilterBar from '../../../src/components/task/TaskFilterBar';
import EmptyState from '../../../src/components/ui/EmptyState';
import Skeleton from '../../../src/components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTasks, setSearchQuery, setFilterStatus, setFilterPriority, selectFilteredTasks } from '../../../src/store/slices/tasksSlice';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import type { Task, TaskStatus, TaskPriority } from '../../../src/types/task.types';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function AllTasksScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, searchQuery, filterStatus, filterPriority } = useAppSelector((s) => s.tasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const [refreshing, setRefreshing] = useState(false);

  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  }, [dispatch]);

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

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch]
  );

  const handleStatusChange = useCallback(
    (status: 'all' | TaskStatus) => {
      dispatch(setFilterStatus(status));
    },
    [dispatch]
  );

  const handlePriorityChange = useCallback(
    (priority: 'all' | TaskPriority) => {
      dispatch(setFilterPriority(priority));
    },
    [dispatch]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <TaskCard task={item} onPress={handleTaskPress} index={index} />
    ),
    [handleTaskPress]
  );

  return (
    <View style={styles.container}>
      <Header title="All Tasks" />

      <View style={styles.content}>
        <TaskSearchBar value={searchQuery} onChangeText={handleSearchChange} />
        <View style={styles.filterContainer}>
          <TaskFilterBar
            activeStatus={filterStatus}
            activePriority={filterPriority}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
          />
        </View>

        {isLoading ? (
          <Skeleton type="card" count={4} />
        ) : (
          <TypedFlashList
            data={filteredTasks}
            renderItem={renderItem}
            estimatedItemSize={130}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary.DEFAULT}
                colors={[colors.primary.DEFAULT]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No tasks found"
                subtitle={searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first task'}
                actionLabel={!searchQuery && filterStatus === 'all' ? 'Create Task' : undefined}
                onAction={!searchQuery && filterStatus === 'all' ? () => router.push('/(admin)/tasks/create') : undefined}
              />
            }
            contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.xs,
    },
    filterContainer: {
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
  });
