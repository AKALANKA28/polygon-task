import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

import Header from '../../../src/components/ui/Header';
import EmployeeProgressCard from '../../../src/components/employee/EmployeeProgressCard';
import Skeleton from '../../../src/components/ui/Skeleton';
import EmptyState from '../../../src/components/ui/EmptyState';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';
import Avatar from '../../../src/components/ui/Avatar';

import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import {
  fetchEmployees,
  updateEmployee,
  deleteEmployee,
} from '../../../src/store/slices/employeesSlice';
import { colors } from '../../../src/theme/colors';
import { spacing, radius, shadows } from '../../../src/theme/spacing';
import { typography } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/ThemeContext';
import { normalize } from '../../../src/utils/responsive';
import { toast } from '../../../src/utils/toast';
import {
  updateEmployeeSchema,
  UpdateEmployeeFormData,
} from '../../../src/utils/validators';
import type { Employee } from '../../../src/types/employee.types';

export default function EmployeesScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: employees, isLoading } = useAppSelector((s) => s.employees);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        (emp.department && emp.department.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  // Modal display states
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ScrollView refs for keyboard scroll-to-field
  const editScrollRef = useRef<ScrollView>(null);

  // Scroll offsets for each input position (approximate)
  const INPUT_HEIGHT = 76; // label + input + margin
  const scrollToField = (ref: React.RefObject<ScrollView | null>, fieldIndex: number) => {
    ref.current?.scrollTo({ y: fieldIndex * INPUT_HEIGHT, animated: true });
  };

  // Edit Form Hook
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchEmployees());
    setRefreshing(false);
  }, [dispatch]);

  const handleCardLongPress = useCallback((employee: Employee) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEmployee(employee);
    setShowActionSheet(true);
  }, []);

  const handleOpenEdit = (employee: Employee) => {
    setShowActionSheet(false);
    setSelectedEmployee(employee);
    setEditValue('name', employee.name);
    setEditValue('email', employee.email);
    setEditValue('department', employee.department || '');
    setEditValue('phone', employee.phone || '');
    setEditValue('password', '');
    setEditValue('confirmPassword', '');
    
    // Tiny delay to allow the first bottom sheet to close cleanly
    setTimeout(() => {
      setShowEditSheet(true);
    }, 250);
  };



  const onEditSubmit = async (data: UpdateEmployeeFormData) => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        updateEmployee({
          id: selectedEmployee.id,
          data: {
            name: data.name.trim(),
            email: data.email.trim(),
            department: data.department?.trim() || '',
            phone: data.phone?.trim() || '',
            password: data.password || undefined,
          },
        })
      );

      if (updateEmployee.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Employee updated successfully');
        resetEditForm();
        Keyboard.dismiss();
        setTimeout(() => setShowEditSheet(false), 250);
        dispatch(fetchEmployees());
      } else {
        const errorMsg = (result.payload as string) || 'Failed to update employee';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    setIsDeleting(true);
    try {
      const result = await dispatch(deleteEmployee(selectedEmployee.id));
      if (deleteEmployee.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Employee deleted successfully');
        setShowDeleteConfirm(false);
        dispatch(fetchEmployees());
      } else {
        const errorMsg = (result.payload as string) || 'Failed to delete employee';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Employees" />

      <View
        style={[
          styles.searchContainer,
          {
            borderColor: isSearchFocused ? colors.brand.purple : themeColors.border,
          }
        ]}
      >
        <View style={styles.searchIcon}>
          <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
            <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Search employees..."
          placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          returnKeyType="search"
          clearButtonMode="never"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')} activeOpacity={0.6}>
            <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
              <Path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

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
        {isLoading && filteredEmployees.length === 0 ? (
          <Skeleton type="card" count={4} />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            subtitle={searchQuery ? "Try adjusting your search query" : "Employees will appear here once added"}
          />
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeProgressCard
              key={employee.id}
              employee={employee}
              onPress={() => router.push(`/(admin)/employees/${employee.id}` as any)}
              onLongPress={() => handleCardLongPress(employee)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={() => {
            router.push('/(admin)/employees/create');
          }}
          activeOpacity={0.8}
          style={[styles.fabButton, { backgroundColor: isDark ? colors.white : colors.neutral[900] }]}
        >
          <Text style={[styles.fabIcon, { color: isDark ? colors.neutral[900] : colors.white }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Long Press Actions Menu Sheet */}
      <Modal
        isVisible={showActionSheet}
        onBackdropPress={() => setShowActionSheet(false)}
        backdropOpacity={0.5}
        style={styles.bottomSheet}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.dragHandle} />
          {selectedEmployee && (
            <View style={styles.actionHeader}>
              <Avatar name={selectedEmployee.name} size={40} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={styles.actionHeaderName}>{selectedEmployee.name}</Text>
                <Text style={styles.actionHeaderEmail}>{selectedEmployee.email}</Text>
              </View>
            </View>
          )}
          <View style={styles.actionButtonsList}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (selectedEmployee) handleOpenEdit(selectedEmployee);
              }}
            >
              <Svg
                width={normalize(20)}
                height={normalize(20)}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.brand.purple}
                strokeWidth={2}
                style={{ marginRight: spacing.md }}
              >
                <Path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.actionItemText, { color: themeColors.text }]}>Edit Employee</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionSheet(false);
                setTimeout(() => setShowDeleteConfirm(true), 250);
              }}
            >
              <Svg
                width={normalize(20)}
                height={normalize(20)}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.semantic.error}
                strokeWidth={2}
                style={{ marginRight: spacing.md }}
              >
                <Path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.actionItemText, { color: colors.semantic.error }]}>Delete Employee</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={[styles.actionItem, { justifyContent: 'center' }]}
              onPress={() => setShowActionSheet(false)}
            >
              <Text
                style={[
                  styles.actionItemText,
                  { color: themeColors.textSecondary, fontFamily: typography.fonts.bold },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Sheet */}
      <Modal
        isVisible={showDeleteConfirm}
        onBackdropPress={() => setShowDeleteConfirm(false)}
        backdropOpacity={0.5}
        style={styles.bottomSheet}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.bottomSheetTitle}>Delete Employee</Text>
          <Text style={styles.bottomSheetMessage}>
            Are you sure you want to delete &quot;{selectedEmployee?.name}&quot;? All assigned tasks and comments will be deleted permanently.
          </Text>
          <View style={styles.bottomSheetButtons}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowDeleteConfirm(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Delete"
                variant="danger"
                onPress={handleConfirmDelete}
                isLoading={isDeleting}
              />
            </View>
          </View>
        </View>
      </Modal>



      {/* Edit Employee Form Bottom Sheet */}
      <Modal
        isVisible={showEditSheet}
        onBackdropPress={() => {
          if (!isSubmitting) {
            Keyboard.dismiss();
            setTimeout(() => setShowEditSheet(false), 250);
          }
        }}
        backdropOpacity={0.5}
        style={styles.bottomSheet}
        avoidKeyboard={true}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
          <View style={[styles.bottomSheetContent, { paddingHorizontal: 0 }]}>
            <View style={styles.dragHandle} />
            <Text style={[styles.bottomSheetTitle, { marginBottom: 12 }]}>Edit Employee</Text>

            <ScrollView
              ref={editScrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.xl,
                paddingBottom: keyboardHeight > 0 ? keyboardHeight - 80 : spacing.xl,
              }}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: Dimensions.get('window').height * 0.65 }}
            >
              <Controller
                control={editControl}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name *"
                    leftIcon="user"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={editErrors.name?.message}
                  />
                )}
              />

              <Controller
                control={editControl}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address *"
                    leftIcon="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={editErrors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <Controller
                control={editControl}
                name="department"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Department (Optional)"
                    leftIcon="building"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={editErrors.department?.message}
                  />
                )}
              />

              <Controller
                control={editControl}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone Number (Optional)"
                    leftIcon="phone"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={editErrors.phone?.message}
                    keyboardType="phone-pad"
                  />
                )}
              />

              <Controller
                control={editControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="New Password (Optional)"
                    leftIcon="lock"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => scrollToField(editScrollRef, 4)}
                    error={editErrors.password?.message}
                    secureTextEntry
                    showPasswordToggle
                    placeholder="Leave blank to keep current"
                  />
                )}
              />

              <Controller
                control={editControl}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm New Password"
                    leftIcon="lock"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => scrollToField(editScrollRef, 5)}
                    error={editErrors.confirmPassword?.message}
                    secureTextEntry
                    showPasswordToggle
                    placeholder="Confirm new password"
                  />
                )}
              />

              <View style={styles.bottomSheetButtons}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeout(() => setShowEditSheet(false), 250);
                    }}
                    disabled={isSubmitting}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Save"
                    onPress={handleEditSubmit(onEditSubmit)}
                    isLoading={isSubmitting}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    contentInner: {
      padding: spacing.base,
      paddingBottom: spacing.xl,
    },
    fabContainer: {
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
    },
    fabIcon: {
      fontSize: normalize(28),
      fontWeight: 'bold',
      color: colors.white,
      marginTop: normalize(-2),
    },
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
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: themeColors.border,
      marginBottom: spacing.md,
    },
    actionHeaderName: {
      fontFamily: typography.fonts.bold,
      fontSize: normalize(16),
      color: themeColors.text,
    },
    actionHeaderEmail: {
      fontFamily: typography.fonts.regular,
      fontSize: normalize(12),
      color: themeColors.textSecondary,
    },
    actionButtonsList: {
      paddingBottom: spacing.md,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    actionItemText: {
      fontFamily: typography.fonts.medium,
      fontSize: normalize(15),
    },
    actionDivider: {
      height: 0.5,
      backgroundColor: themeColors.border,
      marginVertical: spacing.sm,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: normalize(48),
      borderRadius: radius.md,
      borderWidth: 1.5,
      paddingHorizontal: spacing.md,
      backgroundColor: themeColors.card,
      marginHorizontal: spacing.base,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      paddingVertical: 0,
    },
    clearButton: {
      padding: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
