import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { clearError, login } from '../../src/store/slices/authSlice';
import { colors } from '../../src/theme/colors';
import { radius, spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { LoginFormData, loginSchema } from '../../src/utils/validators';
import { useTheme } from '../../src/theme/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, error, user } = useAppSelector((s) => s.auth);
  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  // Shake animation for errors
  const shakeX = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (error) {
      // Shake animation
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 100 }), 3, true),
        withTiming(0, { duration: 50 })
      );
      errorOpacity.value = withTiming(1, { duration: 300 });
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [error, shakeX, errorOpacity]);

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'admin' ? '/(admin)' : '/(employee)');
    }
  }, [user, router]);

  useEffect(() => {
    setStatusBarStyle('light');
    return () => {
      setStatusBarStyle(isDark ? 'light' : 'dark');
    };
  }, [isDark]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const errorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      dispatch(clearError());
      const result = await dispatch(login(data));
      if (login.fulfilled.match(result)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [dispatch]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="light" />

      {/* Gradient Header - Fixed at the top */}
      <LinearGradient
        colors={colors.primary.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.circle, styles.circleBottomLeft]} />

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.headerContent}>
          {/* Logo placeholder */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 120, height: 120, borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Form Card - Scrollable Content */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(500)}
        style={styles.formCard}
      >
        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to your account</Text>

          <Animated.View style={shakeStyle}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  leftIcon="email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  leftIcon="lock"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  showPasswordToggle
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </Animated.View>

          {/* Error display */}
          {error && (
            <Animated.View style={[styles.errorCard, errorStyle]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.semantic.error} strokeWidth={2}>
                <Path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 24,
      flexGrow: 1,
    },
    header: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      paddingBottom: spacing['3xl'],
    },
    circle: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    circleTopRight: {
      top: -100,
      right: -80,
    },
    circleBottomLeft: {
      bottom: -150,
      left: -100,
    },
    headerContent: {
      alignItems: 'center',
      zIndex: 1,
    },
    logoContainer: {
      marginBottom: spacing.xl,
    },
    logoGlow: {
      width: 80,
      height: 80,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoLetter: {
      fontFamily: typography.fonts.extraBold,
      fontSize: 40,
      color: colors.white,
    },
    welcomeText: {
      fontFamily: typography.fonts.bold,
      fontSize: 28,
      color: themeColors.text,
      textAlign: 'center',
    },
    subtitleText: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      color: themeColors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: themeColors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -32,
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5',
      borderWidth: 1,
      borderColor: isDark ? '#EF4444' : '#FECACA',
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.base,
      gap: spacing.sm,
    },
    errorText: {
      flex: 1,
      fontFamily: typography.fonts.medium,
      fontSize: typography.sizes.sm + 1,
      color: isDark ? colors.neutral[200] : '#DC2626',
    },
    buttonContainer: {
      marginTop: spacing.sm,
    },

  });
