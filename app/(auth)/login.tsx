import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
import Svg, { Path, Circle } from 'react-native-svg';
import Button from '../../src/components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { clearError, login } from '../../src/store/slices/authSlice';
import { colors } from '../../src/theme/colors';
import { radius, spacing, shadows } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { LoginFormData, loginSchema } from '../../src/utils/validators';
import { useTheme } from '../../src/theme/ThemeContext';
import Toast from 'react-native-toast-message';

const { height: screenHeight } = Dimensions.get('window');

interface CustomUnderlineInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}

const CustomUnderlineInput: React.FC<CustomUnderlineInputProps> = React.memo(({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secureTextEntry,
  showPasswordToggle,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  returnKeyType,
  onSubmitEditing,
}) => {
  const { isDark, themeColors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const activeColor = colors.brand.purple;
  const inactiveColor = themeColors.border;
  const labelColor = isDark ? colors.neutral[400] : colors.neutral[600];
  const inputTextColor = themeColors.text;
  const placeholderColor = isDark ? colors.neutral[600] : colors.neutral[400];

  return (
    <View style={styles.underlineInputContainer}>
      <Text style={[styles.underlineInputLabel, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          styles.underlineWrapper,
          {
            borderBottomColor: error
              ? colors.semantic.error
              : isFocused
              ? activeColor
              : inactiveColor,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[styles.underlineInput, { color: inputTextColor }]}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure((prev) => !prev)}
            activeOpacity={0.6}
          >
            {isSecure ? (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[500]} strokeWidth={2}>
                <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <Path d="M1 1l22 22" />
              </Svg>
            ) : (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[500]} strokeWidth={2}>
                <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <Circle cx={12} cy={12} r={3} />
              </Svg>
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.underlineInputErrorText}>{error}</Text>}
    </View>
  );
});
CustomUnderlineInput.displayName = 'CustomUnderlineInput';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, error, user } = useAppSelector((s) => s.auth);
  const { isDark, themeColors } = useTheme();
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleSkip = () => {
    Toast.show({
      type: 'info',
      text1: 'Skip Login',
      text2: 'Please sign in to access your workspace.',
    });
  };

  const handleSignUp = () => {
    Toast.show({
      type: 'info',
      text1: 'Sign Up',
      text2: 'Registration is managed by the system administrator.',
    });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: 'info',
      text1: 'Reset Password',
      text2: 'Password recovery feature will be available soon.',
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Background large decorative circles */}
      <View style={[styles.bgCircleLarge, { backgroundColor: isDark ? 'rgba(139, 31, 204, 0.05)' : 'rgba(255, 31, 142, 0.04)' }]} />
      <View style={[styles.bgCircleSmall, { backgroundColor: isDark ? 'rgba(255, 31, 142, 0.05)' : 'rgba(139, 31, 204, 0.04)' }]} />
      <View style={[styles.bgCircleTiny, { backgroundColor: isDark ? 'rgba(255, 31, 142, 0.08)' : 'rgba(139, 31, 204, 0.08)' }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Curved Header Section */}
        <LinearGradient
          colors={colors.primary.gradient as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}
        >
          {/* Skip link */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.headerContent}>
            {/* Round Logo Icon Container */}
            <View style={[styles.logoContainer, shadows.md]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
          </Animated.View>
        </LinearGradient>

        {/* Floating Form Card */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={[styles.formCard, shadows.lg, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        >
          <Animated.View style={shakeStyle}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomUnderlineInput
                  label="Email Address"
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
                <CustomUnderlineInput
                  label="Password"
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

          {/* Form options row (Remember Me & Forgot Password) */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: rememberMe ? colors.brand.purple : themeColors.border,
                    backgroundColor: rememberMe ? colors.brand.purple : 'transparent',
                  },
                ]}
              >
                {rememberMe && (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={3}>
                    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
              <Text style={[styles.rememberMeText, { color: themeColors.textSecondary }]}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={[styles.forgotPasswordText, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error display */}
          {error && (
            <Animated.View 
              style={[
                styles.errorCard, 
                { 
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5',
                  borderColor: isDark ? '#EF4444' : '#FECACA',
                },
                errorStyle
              ]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.semantic.error} strokeWidth={2}>
                <Path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.errorText, { color: isDark ? colors.neutral[200] : '#DC2626' }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="LOGIN"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
              style={{ backgroundColor: colors.brand.purple, borderRadius: 28, height: 56 }}
            />
          </View>

          {/* Footer link */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={styles.signUpText} onPress={handleSignUp}>
                SIGN UP
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Bg accents
  bgCircleLarge: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  bgCircleSmall: {
    position: 'absolute',
    bottom: 40,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  bgCircleTiny: {
    position: 'absolute',
    bottom: 120,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  // Header section
  headerContainer: {
    height: screenHeight * 0.35,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    padding: spacing.xs,
    zIndex: 10,
  },
  skipButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm + 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  welcomeText: {
    fontFamily: typography.fonts.bold,
    fontSize: 24,
    color: colors.white,
  },
  // Form Card
  formCard: {
    borderRadius: 32,
    marginTop: -32,
    marginHorizontal: 20,
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: 28,
    borderWidth: 1,
  },
  // Underline input styles
  underlineInputContainer: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  underlineInputLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  underlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 1.5,
  },
  underlineInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.base,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineInputErrorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm - 1,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  // Options row (Remember me & Forgot Password)
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  forgotPasswordText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm + 1,
  },
  buttonContainer: {
    marginTop: spacing.xs,
  },
  // Footer
  footerContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  signUpText: {
    fontFamily: typography.fonts.bold,
    color: colors.brand.purple,
  },
});
