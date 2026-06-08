import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
import { useTheme } from '../../../src/theme/ThemeContext';
import Svg, { Path } from 'react-native-svg';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { themeMode, setThemeMode, themeColors, isDark } = useTheme();
  const styles = getStyles(isDark, themeColors);

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

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceTitle}>Theme Mode</Text>
              <Text style={styles.preferenceSubtitle}>Choose app appearance preference</Text>
            </View>
            <View style={styles.themeOptions}>
              {(['system', 'light', 'dark'] as const).map((mode) => {
                const isActive = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.themeOption,
                      isActive && styles.themeOptionActive,
                      isActive && { borderColor: colors.brand.magenta }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setThemeMode(mode);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        isActive && styles.themeOptionTextActive,
                        isActive && { color: colors.brand.magenta }
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    scrollContent: { paddingBottom: spacing['4xl'] },
    profileSection: {
      alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm,
    },
    profileName: {
      fontFamily: typography.fonts.bold, fontSize: 22, color: themeColors.text,
    },
    profileEmail: {
      fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: themeColors.textSecondary,
    },
    formSection: {
      paddingHorizontal: spacing.xl, marginTop: spacing.base,
    },
    preferencesSection: {
      paddingHorizontal: spacing.xl,
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontFamily: typography.fonts.semiBold,
      fontSize: typography.sizes.md,
      color: themeColors.text,
      marginBottom: spacing.sm,
    },
    preferenceCard: {
      backgroundColor: themeColors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      padding: spacing.md,
    },
    preferenceHeader: {
      marginBottom: spacing.md,
    },
    preferenceTitle: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.base,
      color: themeColors.text,
    },
    preferenceSubtitle: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.sm,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    themeOption: {
      flex: 1,
      height: 40,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: themeColors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
    },
    themeOptionActive: {
      backgroundColor: isDark ? 'rgba(255, 31, 142, 0.1)' : 'rgba(255, 31, 142, 0.05)',
    },
    themeOptionText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm,
      color: themeColors.textSecondary,
    },
    themeOptionTextActive: {
      fontFamily: typography.fonts.semiBold,
    },
    logoutSection: {
      paddingHorizontal: spacing.xl, marginTop: spacing.lg,
    },
    divider: {
      height: 1, backgroundColor: themeColors.border, marginBottom: spacing.lg,
    },
    modal: { justifyContent: 'flex-end', margin: 0 },
    modalContent: {
      backgroundColor: themeColors.card,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      padding: spacing.xl,
      paddingBottom: spacing['3xl'],
    },
    modalTitle: {
      fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.lg, color: themeColors.text,
      textAlign: 'center',
    },
    modalMessage: {
      fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: themeColors.textSecondary,
      textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl,
    },
    modalButtons: {
      flexDirection: 'row', gap: spacing.md,
    },
  });
