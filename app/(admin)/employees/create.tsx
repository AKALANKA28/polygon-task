import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';

import Header from '../../../src/components/ui/Header';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';

import { useAppDispatch } from '../../../src/store/hooks';
import { createEmployee, fetchEmployees } from '../../../src/store/slices/employeesSlice';
import { colors } from '../../../src/theme/colors';
import { spacing, radius } from '../../../src/theme/spacing';
import { typography } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/ThemeContext';
import { normalize } from '../../../src/utils/responsive';
import { toast } from '../../../src/utils/toast';
import {
  createEmployeeSchema,
  CreateEmployeeFormData,
} from '../../../src/utils/validators';

export default function CreateEmployeeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Scroll offsets for input field focus behavior
  const INPUT_HEIGHT = 76;
  const scrollToField = (fieldIndex: number) => {
    scrollRef.current?.scrollTo({ y: fieldIndex * INPUT_HEIGHT, animated: true });
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createEmployee({
          name: data.name.trim(),
          email: data.email.trim(),
          department: data.department?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          password: data.password,
        })
      );

      if (createEmployee.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Employee added successfully');
        reset();
        Keyboard.dismiss();
        dispatch(fetchEmployees());
        router.back();
      } else {
        const errorMsg = (result.payload as string) || 'Failed to add employee';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add Employee"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldsContainer}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name *"
                  leftIcon="user"
                  placeholder="Enter employee name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address *"
                  leftIcon="email"
                  placeholder="Enter email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Department (Optional)"
                  leftIcon="building"
                  placeholder="e.g. Engineering, Sales"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.department?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number (Optional)"
                  leftIcon="phone"
                  placeholder="Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password *"
                  leftIcon="lock"
                  placeholder="Enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onFocus={() => scrollToField(4)}
                  error={errors.password?.message}
                  secureTextEntry
                  showPasswordToggle
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password *"
                  leftIcon="lock"
                  placeholder="Re-enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onFocus={() => scrollToField(5)}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  showPasswordToggle
                />
              )}
            />
          </View>

          <View style={styles.submitContainer}>
            <Button
              title="Create Employee"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    submitContainer: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
  });
