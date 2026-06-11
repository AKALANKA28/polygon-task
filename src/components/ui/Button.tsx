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
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import { normalize } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeContext';

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
  const { isDark, themeColors } = useTheme();
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
    const isButtonDisabled = disabled; // Only style as disabled when explicitly disabled (not just loading)
    switch (variant) {
      case 'danger':
        return {
          container: [
            styles.dangerContainer,
            isButtonDisabled && (isDark ? styles.disabledContainerDark : styles.disabledContainerLight),
            isLoading && { opacity: 0.7 }
          ],
          textColor: colors.white,
          disabledTextColor: isDark ? colors.neutral[600] : colors.neutral[400],
          indicatorColor: colors.white,
        };
      case 'outline':
        return {
          container: [
            styles.outlineContainer,
            { borderColor: themeColors.border },
            isButtonDisabled && (isDark ? styles.disabledContainerDark : styles.disabledContainerLight),
            isLoading && { opacity: 0.7 }
          ],
          textColor: themeColors.text,
          disabledTextColor: isDark ? colors.neutral[600] : colors.neutral[400],
          indicatorColor: themeColors.text,
        };
      case 'ghost':
        return {
          container: [
            styles.ghostContainer,
            isButtonDisabled && (isDark ? styles.disabledContainerDark : styles.disabledContainerLight),
            isLoading && { opacity: 0.7 }
          ],
          textColor: themeColors.textSecondary,
          disabledTextColor: isDark ? colors.neutral[600] : colors.neutral[400],
          indicatorColor: themeColors.textSecondary,
        };
      case 'primary':
      default:
        return {
          container: [
            isDark ? styles.primaryContainerDark : styles.primaryContainerLight,
            isButtonDisabled && (isDark ? styles.disabledContainerDark : styles.disabledContainerLight),
            isLoading && { opacity: 0.7 }
          ],
          textColor: isDark ? colors.neutral[900] : colors.white,
          disabledTextColor: isDark ? colors.neutral[600] : colors.neutral[400],
          indicatorColor: isDark ? colors.neutral[900] : colors.white,
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
        <Text style={[
          styles.text,
          styles[`text_${size}`],
          { color: disabled ? variantStyles.disabledTextColor : variantStyles.textColor }
        ]}>
          {title}
        </Text>
      </View>
    );
  };

  return (
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
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sm: {
    height: normalize(36),
    paddingHorizontal: spacing.md,
  },
  md: {
    height: normalize(44),
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: normalize(52),
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
  // Primary - Light Mode (Black background, White text)
  primaryContainerLight: {
    backgroundColor: colors.neutral[900],
    ...shadows.sm,
  },
  primaryTextLight: {
    color: colors.white,
  },
  // Primary - Dark Mode (White background, Black text)
  primaryContainerDark: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  primaryTextDark: {
    color: colors.neutral[900],
  },
  // Outline
  outlineContainer: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
  },
  outlineText: {
    fontFamily: typography.fonts.semiBold,
  },
  // Ghost
  ghostContainer: {
    backgroundColor: colors.transparent,
  },
  ghostText: {
    fontFamily: typography.fonts.semiBold,
  },
  // Danger (Solid premium red button)
  dangerContainer: {
    backgroundColor: colors.semantic.error,
    ...shadows.sm,
  },
  dangerText: {
    color: colors.white,
  },
  // Disabled state - Light Mode
  disabledContainerLight: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledTextLight: {
    color: colors.neutral[400],
  },
  // Disabled state - Dark Mode
  disabledContainerDark: {
    backgroundColor: colors.neutral[900],
    borderColor: colors.neutral[800],
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledTextDark: {
    color: colors.neutral[600],
  },
});
