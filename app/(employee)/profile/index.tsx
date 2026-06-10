import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import Header from '../../../src/components/ui/Header';
import Avatar from '../../../src/components/ui/Avatar';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';
import Badge from '../../../src/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { logout, updateUser } from '../../../src/store/slices/authSlice';
import { employeeService } from '../../../src/services/employeeService';
import { profileSchema, ProfileFormData } from '../../../src/utils/validators';
import { toast } from '../../../src/utils/toast';
import { storage } from '../../../src/utils/storage';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { useTheme } from '../../../src/theme/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import { normalize } from '../../../src/utils/responsive';

const AVATAR_SEEDS = [
  'Alexander',
  'Isabella',
  'William',
  'Sophia',
  'James',
  'Olivia',
  'Benjamin',
  'Mia',
];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.avatar_url || null);
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
        const response = await employeeService.updateProfile({
          ...data,
          avatar_url: selectedAvatar,
        });

        // Update local storage
        await storage.setItem('user', JSON.stringify(response));

        // Update redux state — map Employee response to User shape (null → undefined)
        dispatch(updateUser({
          name: response.name,
          phone: response.phone ?? undefined,
          department: response.department ?? undefined,
          avatar_url: response.avatar_url ?? undefined,
        }));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Profile updated successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to update profile');
      }
      setIsSaving(false);
    },
    [dispatch, selectedAvatar]
  );

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await dispatch(logout());
    router.replace('/(auth)/login');
  }, [dispatch, router]);

  return (
    <View style={styles.container}>
      <Header title="My Profile" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAvatarModal(true);
            }}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            <Avatar name={user?.name || 'User'} seed={selectedAvatar} size={84} />
            <View style={styles.editIconBadge}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </TouchableOpacity>
          <Text style={styles.changeAvatarText}>Tap to change avatar</Text>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Edit Form */}
        <View style={styles.formSection}>
          <Input
            label="Email Address"
            leftIcon="email"
            value={user?.email}
            editable={false}
          />
          <Input
            label="Role"
            leftIcon="user"
            value={user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}
            editable={false}
          />

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
              <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={colors.semantic.error} strokeWidth={2}>
                <Path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Avatar Selection Modal */}
      <Modal
        isVisible={showAvatarModal}
        onBackdropPress={() => setShowAvatarModal(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>Choose Your Avatar</Text>
          <Text style={styles.modalMessage}>Select an avatar style that represents you</Text>

          <View style={styles.avatarGrid}>
            {AVATAR_SEEDS.map((seed) => {
              const isSelected = selectedAvatar === seed;
              return (
                <TouchableOpacity
                  key={seed}
                  style={[
                    styles.avatarGridItem,
                    isSelected && styles.avatarGridItemActive
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAvatar(seed);
                    setShowAvatarModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Avatar name={user?.name || 'User'} seed={seed} size={60} />
                  {isSelected && (
                    <View style={styles.selectedCheckBadge}>
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={3}>
                        <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setShowAvatarModal(false)}
            size="md"
            style={{ marginTop: spacing.md, borderWidth: 1.2, borderColor: themeColors.border }}
          />
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={showLogoutModal}
        onBackdropPress={() => setShowLogoutModal(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>Sign Out</Text>
          <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
          <View style={styles.modalButtons}>
            <View style={{ flex: 1 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowLogoutModal(false)}
                size="md"
                style={{ borderWidth: 1.2, borderColor: themeColors.border }}
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
    </View>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background, overflow: 'hidden' },
    scrollContent: { paddingBottom: spacing.xl },
    profileSection: {
      alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm,
    },
    avatarWrapper: {
      position: 'relative',
    },
    editIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.brand.magenta,
      width: normalize(24),
      height: normalize(24),
      borderRadius: normalize(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: themeColors.card,
    },
    changeAvatarText: {
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm,
      color: themeColors.textSecondary,
      marginTop: spacing.xs,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: spacing.md,
      marginVertical: spacing.md,
    },
    avatarGridItem: {
      position: 'relative',
      padding: spacing.xs,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    avatarGridItemActive: {
      borderColor: colors.brand.magenta,
    },
    selectedCheckBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: colors.brand.magenta,
      width: normalize(18),
      height: normalize(18),
      borderRadius: normalize(9),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: themeColors.card,
    },
    profileName: {
      fontFamily: typography.fonts.bold, fontSize: normalize(22), color: themeColors.text,
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
      height: normalize(40),
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
    dragHandle: {
      width: normalize(40),
      height: normalize(5),
      borderRadius: normalize(3),
      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300],
      alignSelf: 'center',
      marginBottom: spacing.base,
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
