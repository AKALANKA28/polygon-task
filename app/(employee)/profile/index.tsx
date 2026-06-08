import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import Avatar from '../../../src/components/ui/Avatar';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';
import Badge from '../../../src/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { logout } from '../../../src/store/slices/authSlice';
import { employeeService } from '../../../src/services/employeeService';
import { profileSchema, ProfileFormData } from '../../../src/utils/validators';
import { toast } from '../../../src/utils/toast';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import Svg, { Path } from 'react-native-svg';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      setIsSaving(true);
      try {
        await employeeService.updateProfile(data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Profile updated successfully!');
      } catch {
        toast.error('Failed to update profile');
      }
      setIsSaving(false);
    },
    []
  );

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await dispatch(logout());
    router.replace('/(auth)/login');
  }, [dispatch, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <GradientHeader title="My Profile" height={140} />

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar name={user?.name || 'User'} size={80} fontSize={30} />
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Badge
            label="Employee"
            backgroundColor={colors.brand.purple}
            textColor={colors.white}
            size="md"
          />
        </View>

        {/* Edit Form */}
        <View style={styles.formSection}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                leftIcon="user"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone"
                leftIcon="phone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
              />
            )}
          />
          <Controller
            control={control}
            name="department"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Department"
                leftIcon="building"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSaving}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <View style={styles.divider} />
          <Button
            title="Sign Out"
            variant="danger"
            onPress={() => setShowLogoutModal(true)}
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.semantic.error} strokeWidth={2}>
                <Path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={showLogoutModal}
        onBackdropPress={() => setShowLogoutModal(false)}
        backdropOpacity={0.5}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sign Out</Text>
          <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
          <View style={styles.modalButtons}>
            <View style={{ flex: 1 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowLogoutModal(false)}
                size="md"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Sign Out"
                variant="danger"
                onPress={handleLogout}
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  scrollContent: { paddingBottom: spacing['4xl'] },
  profileSection: {
    alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm,
  },
  profileName: {
    fontFamily: typography.fonts.bold, fontSize: 22, color: colors.neutral[900],
  },
  profileEmail: {
    fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.neutral[500],
  },
  formSection: {
    paddingHorizontal: spacing.xl, marginTop: spacing.base,
  },
  logoutSection: {
    paddingHorizontal: spacing.xl, marginTop: spacing.lg,
  },
  divider: {
    height: 1, backgroundColor: colors.surface.border, marginBottom: spacing.lg,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  modalTitle: {
    fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.lg, color: colors.neutral[900],
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.neutral[500],
    textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row', gap: spacing.md,
  },
});
