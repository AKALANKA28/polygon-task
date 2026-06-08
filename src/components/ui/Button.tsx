import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const buttonDisabled = disabled || isLoading;

  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          container: [styles.dangerContainer, buttonDisabled && styles.disabledContainer],
          text: styles.dangerText,
          indicatorColor: colors.semantic.error,
        };
      case 'outline':
        return {
          container: [styles.outlineContainer, buttonDisabled && styles.disabledContainer],
          text: styles.outlineText,
          indicatorColor: colors.primary.DEFAULT,
        };
      case 'ghost':
        return {
          container: [styles.ghostContainer, buttonDisabled && styles.disabledContainer],
          text: styles.ghostText,
          indicatorColor: colors.neutral[500],
        };
      case 'primary':
      default:
        return {
          container: [styles.primaryContainer, buttonDisabled && styles.disabledContainer],
          text: styles.primaryText,
          indicatorColor: colors.white,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyles.indicatorColor}
          style={styles.loader}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, styles[`text_${size}`], variantStyles.text, disabled && styles.disabledText]}>
          {title}
        </Text>
      </View>
    );
  };

  const mainPressable = (
    <AnimatedPressable
      onPress={buttonDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.baseButton,
        styles[size],
        variantStyles.container,
        animatedStyle,
        style,
      ]}
    >
      {variant === 'primary' && !buttonDisabled ? (
        <LinearGradient
          colors={colors.primary.gradient as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradientBg]}
        />
      ) : null}
      {renderContent()}
    </AnimatedPressable>
  );

  return mainPressable;
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gradientBg: {
    borderRadius: radius.md,
  },
  sm: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.xl,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: typography.sizes.xs + 1,
  },
  text_md: {
    fontSize: typography.sizes.sm + 1,
  },
  text_lg: {
    fontSize: typography.sizes.base,
  },
  loader: {
    zIndex: 2,
  },
  // Primary
  primaryContainer: {
    backgroundColor: colors.primary.DEFAULT,
    ...shadows.sm,
  },
  primaryText: {
    color: colors.white,
  },
  // Outline
  outlineContainer: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  outlineText: {
    color: colors.primary.DEFAULT,
  },
  // Ghost
  ghostContainer: {
    backgroundColor: colors.transparent,
  },
  ghostText: {
    color: colors.neutral[600],
  },
  // Danger
  dangerContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.semantic.error + '40',
  },
  dangerText: {
    color: colors.semantic.error,
  },
  // Disabled
  disabledContainer: {
    backgroundColor: colors.neutral[200],
    borderColor: colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: colors.neutral[400],
  },
});
