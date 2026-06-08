import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import EmployeeProgressCard from '../../../src/components/employee/EmployeeProgressCard';
import Skeleton from '../../../src/components/ui/Skeleton';
import EmptyState from '../../../src/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchEmployees } from '../../../src/store/slices/employeesSlice';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';

export default function EmployeesScreen() {
  const dispatch = useAppDispatch();
  const { items: employees, isLoading } = useAppSelector((s) => s.employees);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchEmployees());
    setRefreshing(false);
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <GradientHeader title="Employees" subtitle="Track team progress" height={140} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {isLoading ? (
          <Skeleton type="card" count={4} />
        ) : employees.length === 0 ? (
          <EmptyState title="No employees found" subtitle="Employees will appear here once added" />
        ) : (
          employees.map((employee) => (
            <EmployeeProgressCard key={employee.id} employee={employee} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
});
