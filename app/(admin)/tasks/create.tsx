import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';
import Avatar from '../../../src/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { createTask } from '../../../src/store/slices/tasksSlice';
import { fetchEmployees } from '../../../src/store/slices/employeesSlice';
import { taskSchema, TaskFormData } from '../../../src/utils/validators';
import { toast } from '../../../src/utils/toast';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { useTheme } from '../../../src/theme/ThemeContext';
import type { Employee } from '../../../src/types/employee.types';

const getPriorityColorsAdaptive = (priority: 'low' | 'medium' | 'high', isDark: boolean) => {
  if (!isDark) {
    return {
      low: { bg: '#F0FDF4', text: '#166534' },
      medium: { bg: '#FFFBEB', text: '#92400E' },
      high: { bg: '#FFF1F2', text: '#9F1239' },
    }[priority];
  }
  return {
    low: { bg: 'rgba(22, 101, 52, 0.15)', text: '#4ADE80' },
    medium: { bg: 'rgba(146, 64, 14, 0.15)', text: '#FBBF24' },
    high: { bg: 'rgba(159, 18, 57, 0.15)', text: '#F87171' },
  }[priority];
};

export default function CreateTaskScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: employees } = useAppSelector((s) => s.employees);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const onSubmit = useCallback(
    async (data: TaskFormData) => {
      setIsSubmitting(true);
      try {
        const result = await dispatch(createTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          assigned_to: data.assigned_to,
          due_date: data.due_date,
        }));
        if (createTask.fulfilled.match(result)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Task created successfully!');
          router.back();
        } else {
          toast.error('Failed to create task');
        }
      } catch {
        toast.error('An error occurred');
      }
      setIsSubmitting(false);
    },
    [dispatch, router]
  );

  const handleEmployeeSelect = useCallback(
    (employee: Employee) => {
      setSelectedEmployee(employee);
      setValue('assigned_to', employee.id);
      setShowEmployeeModal(false);
    },
    [setValue]
  );

  const getPriorityStyle = (pVal: 'low' | 'medium' | 'high', currentVal: 'low' | 'medium' | 'high') => {
    const isSelected = pVal === currentVal;
    if (isSelected) {
      const pColors = getPriorityColorsAdaptive(pVal, isDark);
      return { backgroundColor: pColors.bg, borderColor: pColors.text, text: pColors.text };
    }
    return {
      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
      borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
      text: isDark ? colors.neutral[400] : colors.neutral[500],
    };
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <GradientHeader height={120}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
              <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.backText}>Tasks</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Create Task</Text>
      </GradientHeader>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Task Title"
              placeholder="Enter task title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              maxLength={200}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description"
              placeholder="Enter task description (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              containerStyle={{ marginBottom: spacing.base }}
            />
          )}
        />

        {/* Priority Selector */}
        <Text style={styles.label}>Priority</Text>
        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map((pVal) => {
                const styleObj = getPriorityStyle(pVal, value);
                return (
                  <TouchableOpacity
                    key={pVal}
                    style={[
                      styles.priorityPill,
                      { backgroundColor: styleObj.backgroundColor, borderColor: styleObj.borderColor },
                    ]}
                    onPress={() => onChange(pVal)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: styleObj.text },
                      ]}
                    >
                      {pVal.charAt(0).toUpperCase() + pVal.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {errors.priority && <Text style={styles.errorText}>{errors.priority.message}</Text>}

        {/* Assign to Employee */}
        <Text style={styles.label}>Assign to Employee</Text>
        <TouchableOpacity
          style={[styles.selectField, errors.assigned_to && styles.selectFieldError]}
          onPress={() => setShowEmployeeModal(true)}
        >
          {selectedEmployee ? (
            <View style={styles.selectedEmployee}>
              <Avatar name={selectedEmployee.name} size={28} />
              <Text style={styles.selectedEmployeeName}>{selectedEmployee.name}</Text>
            </View>
          ) : (
            <Text style={styles.selectPlaceholder}>Select an employee</Text>
          )}
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isDark ? colors.neutral[500] : colors.neutral[400]} strokeWidth={2}>
            <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        {errors.assigned_to && <Text style={styles.errorText}>{errors.assigned_to.message}</Text>}

        <View style={styles.submitContainer}>
          <Button
            title="Create Task"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>

      {/* Employee Selection Modal */}
      <Modal visible={showEmployeeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Employee</Text>
              <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={isDark ? colors.neutral[400] : colors.neutral[600]} strokeWidth={2}>
                  <Path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            <FlatList
              data={employees}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.employeeRow}
                  onPress={() => handleEmployeeSelect(item)}
                >
                  <Avatar name={item.name} size={40} />
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.employeeEmail}>{item.email}</Text>
                  </View>
                  {selectedEmployee?.id === item.id && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary.DEFAULT} strokeWidth={2.5}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    backText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: colors.white,
    },
    headerTitle: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.sizes['2xl'],
      color: colors.white,
      marginTop: spacing.sm,
    },
    form: {
      flex: 1,
    },
    formContent: {
      padding: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    label: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm + 1,
      color: themeColors.text,
      marginBottom: spacing.sm,
    },
    priorityRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.base,
    },
    priorityPill: {
      flex: 1,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priorityText: {
      fontFamily: typography.fonts.semiBold,
      fontSize: typography.sizes.base,
    },
    selectField: {
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: themeColors.border,
      backgroundColor: themeColors.card,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      justifyContent: 'space-between',
      marginBottom: spacing.base,
    },
    selectFieldError: {
      borderColor: colors.semantic.error,
    },
    selectPlaceholder: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      color: isDark ? colors.neutral[500] : colors.neutral[400],
    },
    selectedEmployee: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    selectedEmployeeName: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: themeColors.text,
    },
    errorText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm,
      color: colors.semantic.error,
      marginTop: -spacing.sm,
      marginBottom: spacing.md,
    },
    submitContainer: {
      marginTop: spacing.lg,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: themeColors.card,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      maxHeight: '70%',
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      fontFamily: typography.fonts.semiBold,
      fontSize: typography.sizes.lg,
      color: themeColors.text,
    },
    employeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      gap: spacing.md,
    },
    employeeInfo: {
      flex: 1,
    },
    employeeName: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: themeColors.text,
    },
    employeeEmail: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.sm,
      color: themeColors.textSecondary,
    },
  });
