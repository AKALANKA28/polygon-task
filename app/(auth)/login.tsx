import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { login, clearError } from '../../src/store/slices/authSlice';
import { loginSchema, LoginFormData } from '../../src/utils/validators';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radius } from '../../src/theme/spacing';
import Svg, { Path } from 'react-native-svg';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, error, user } = useAppSelector((s) => s.auth);

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={colors.primary.gradient as unknown as [string, string]}
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
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.10)'] as unknown as [string, string]}
                style={styles.logoGlow}
              >
                <Text style={styles.logoLetter}>P</Text>
              </LinearGradient>
            </View>

            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
          </Animated.View>
        </LinearGradient>

        {/* Form Card */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.formCard}
        >
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

          {/* Demo credentials hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Demo Credentials</Text>
            <Text style={styles.hintText}>Admin: admin@polygon.com</Text>
            <Text style={styles.hintText}>Employee: jane@polygon.com</Text>
            <Text style={styles.hintText}>Password: password123</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    minHeight: screenHeight * 0.38,
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
    color: colors.white,
  },
  subtitleText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm + 1,
    color: '#DC2626',
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  hintContainer: {
    marginTop: spacing['2xl'],
    padding: spacing.base,
    backgroundColor: colors.surface.overlay,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  hintTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.brand.purple,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
});
