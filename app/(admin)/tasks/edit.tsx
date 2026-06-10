import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import Header from '../../../src/components/ui/Header';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';
import Avatar from '../../../src/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTaskById, updateTask } from '../../../src/store/slices/tasksSlice';
import { fetchEmployees } from '../../../src/store/slices/employeesSlice';
import { taskSchema, TaskFormData } from '../../../src/utils/validators';
import { toast } from '../../../src/utils/toast';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { useTheme } from '../../../src/theme/ThemeContext';
import { normalize } from '../../../src/utils/responsive';
import type { Employee } from '../../../src/types/employee.types';

const { width: screenWidth } = Dimensions.get('window');

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

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: employees } = useAppSelector((s) => s.employees);
  const { selectedTask: task, isLoading } = useAppSelector((s) => s.tasks);
  
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<Record<number, string>>({});
  const [project, setProject] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: [],
      due_date: '',
    },
  });

  useEffect(() => {
    dispatch(fetchEmployees());
    if (id) {
      dispatch(fetchTaskById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (task && id && Number(task.id) === Number(id)) {
      const projectRegex = /^\[Project:\s*([^\]]+)\]\s*(.*)$/s;
      const match = task.description ? task.description.match(projectRegex) : null;
      const projectName = match ? match[1].trim() : '';
      const descriptionText = match ? match[2].trim() : (task.description || '');
      
      setProject(projectName);
      
      const taskDate = task.due_date ? new Date(task.due_date) : new Date(Date.now() + 86400000);
      setSelectedDate(taskDate);
      setCalendarDate(taskDate);
      
      if (task.assignees) {
        setSelectedEmployees(task.assignees);
        const initialSubtasks: Record<number, string> = {};
        task.assignees.forEach((a) => {
          initialSubtasks[a.id] = a.subtask || '';
        });
        setSubtasks(initialSubtasks);
        
        reset({
          title: task.title,
          description: descriptionText,
          priority: task.priority,
          assigned_to: task.assignees.map(a => ({ id: a.id, subtask: a.subtask || null })),
          due_date: task.due_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        });
      }
    }
  }, [task, id, reset]);

  // Sync date changes to hook form
  useEffect(() => {
    setValue('due_date', selectedDate.toISOString().split('T')[0]);
  }, [selectedDate, setValue]);

  const onSubmit = useCallback(
    async (data: TaskFormData) => {
      setIsSubmitting(true);
      try {
        const fullDescription = project.trim()
          ? `[Project: ${project.trim()}] ${data.description?.trim() || ''}`
          : data.description?.trim() || '';

        const result = await dispatch(updateTask({
          id: Number(id),
          dto: {
            title: data.title.trim(),
            description: fullDescription || undefined,
            priority: data.priority,
            assigned_to: data.assigned_to,
            due_date: data.due_date,
          }
        }));
        if (updateTask.fulfilled.match(result)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Task updated successfully!');
          // Force refresh task details
          dispatch(fetchTaskById(Number(id)));
          router.back();
        } else {
          const errorMsg = (result.payload as string) || 'Failed to update task';
          toast.error(errorMsg);
        }
      } catch {
        toast.error('An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, id, router, project]
  );

  const handleEmployeeToggle = useCallback(
    (employee: Employee) => {
      setSelectedEmployees((prev) => {
        const exists = prev.some((e) => e.id === employee.id);
        const updated = exists
          ? prev.filter((e) => e.id !== employee.id)
          : [...prev, employee];
        
        const assignedVal = updated.map((e) => ({
          id: e.id,
          subtask: subtasks[e.id] || null,
        }));
        setValue('assigned_to', assignedVal, { shouldValidate: true });
        return updated;
      });
    },
    [setValue, subtasks]
  );

  const handleSubtaskChange = (employeeId: number, text: string) => {
    setSubtasks((prev) => {
      const updatedSubtasks = { ...prev, [employeeId]: text };
      const assignedVal = selectedEmployees.map((e) => ({
        id: e.id,
        subtask: e.id === employeeId ? text : (prev[e.id] || null),
      }));
      setValue('assigned_to', assignedVal, { shouldValidate: true });
      return updatedSubtasks;
    });
  };

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

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
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

  if (isLoading && !task) {
    return (
      <View style={styles.container}>
        <Header title="Edit Task" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Edit Task"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fieldsContainer}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Task Title *"
                  placeholder="Enter task title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  maxLength={200}
                />
              )}
            />

            <Input
              label="Project Name (Optional)"
              placeholder="e.g. Website Redesign"
              value={project}
              onChangeText={setProject}
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

            {/* Due Date Selector */}
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.selectField}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={styles.selectText}>
                {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={isDark ? colors.neutral[500] : colors.neutral[400]} strokeWidth={2}>
                <Path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Assign to Employee */}
            <Text style={styles.label}>Assign to Employees *</Text>
            <TouchableOpacity
              style={[styles.selectField, errors.assigned_to && styles.selectFieldError]}
              onPress={() => setShowEmployeeModal(true)}
            >
              {selectedEmployees.length > 0 ? (
                <View style={styles.selectedEmployeesRow}>
                  <View style={styles.avatarStack}>
                    {selectedEmployees.slice(0, 3).map((emp, idx) => (
                      <View key={emp.id} style={{ marginLeft: idx > 0 ? -12 : 0, zIndex: 3 - idx }}>
                        <Avatar name={emp.name} size={28} />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.selectedEmployeeName} numberOfLines={1}>
                    {selectedEmployees.length === 1
                      ? selectedEmployees[0].name
                      : `${selectedEmployees.length} employees selected`}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectPlaceholder}>Select employees</Text>
              )}
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isDark ? colors.neutral[500] : colors.neutral[400]} strokeWidth={2}>
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            {errors.assigned_to && <Text style={styles.errorText}>{errors.assigned_to.message}</Text>}

            {/* Subtasks List */}
            {selectedEmployees.length > 0 && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={[styles.label, { marginBottom: spacing.md }]}>Assign Subtask per Employee</Text>
                {selectedEmployees.map((employee) => (
                  <Input
                    key={`subtask-${employee.id}`}
                    label={`Subtask for ${employee.name}`}
                    placeholder="E.g. Build API endpoints"
                    value={subtasks[employee.id] || ''}
                    onChangeText={(text) => handleSubtaskChange(employee.id, text)}
                    containerStyle={{ marginBottom: spacing.md }}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.submitContainer}>
            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal (Custom Calendar Overlay) */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarNavBtn}>
                <Text style={{ fontSize: normalize(18), color: colors.brand.purple }}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavBtn}>
                <Text style={{ fontSize: normalize(18), color: colors.brand.purple }}>▶</Text>
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
        </View>
      </Modal>

      {/* Employee Selection Modal */}
      <Modal visible={showEmployeeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Employees</Text>
              <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={isDark ? colors.neutral[400] : colors.neutral[600]} strokeWidth={2}>
                  <Path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            <FlatList
              data={employees}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedEmployees.some((e) => e.id === item.id);
                return (
                  <TouchableOpacity
                    style={styles.employeeRow}
                    onPress={() => handleEmployeeToggle(item)}
                  >
                    <Avatar name={item.name} size={40} />
                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>{item.name}</Text>
                      <Text style={styles.employeeEmail}>{item.email}</Text>
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
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            />
            <Button
              title="Done"
              onPress={() => setShowEmployeeModal(false)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    form: {
      flex: 1,
    },
    formContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['3xl'],
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    fieldsContainer: {
      flex: 1,
      width: '100%',
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
    selectText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: themeColors.text,
    },
    selectPlaceholder: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      color: isDark ? colors.neutral[500] : colors.neutral[400],
    },
    selectedEmployeesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    avatarStack: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedEmployeeName: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: themeColors.text,
      flex: 1,
    },
    errorText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm,
      color: colors.semantic.error,
      marginTop: -spacing.sm,
      marginBottom: spacing.md,
    },
    submitContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalOverlayCenter: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: themeColors.card,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      maxHeight: '80%',
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['3xl'],
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
    checkbox: {
      width: normalize(20),
      height: normalize(20),
      borderRadius: normalize(6),
      borderWidth: 1.5,
      borderColor: themeColors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Calendar Styles
    calendarModalContent: {
      width: screenWidth * 0.85,
      backgroundColor: themeColors.card,
      borderRadius: radius['2xl'],
      padding: spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
