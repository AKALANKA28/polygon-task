import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { normalize } from '../../utils/responsive';

interface GradientHeaderProps {
  height?: number;
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backLabel?: string;
  usePrimaryGradient?: boolean;
}

export default function GradientHeader({
  height = 140,
  title,
  subtitle,
  leftContent,
  rightContent,
  children,
  showBackButton = false,
  onBackPress,
  backLabel,
  usePrimaryGradient = true,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeColors } = useTheme();

  const containerHeight = normalize(height) + insets.top;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderContent = () => {
    const textColor = usePrimaryGradient ? colors.white : themeColors.text;
    const subColor = usePrimaryGradient ? 'rgba(255, 255, 255, 0.75)' : themeColors.textSecondary;

    if (children) {
      return (
        <View style={styles.childLayout}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButtonInline}>
              <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              {backLabel && (
                <Text style={[styles.backTextInline, { color: textColor }]}>
                  {backLabel}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {children}
        </View>
      );
    }

    return (
      <View style={styles.defaultLayout}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <View>
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
                <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2.5}>
                  <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                {backLabel && (
                  <Text style={[styles.backText, { color: textColor }]}>
                    {backLabel}
                  </Text>
                )}
              </TouchableOpacity>
              {title && (
                <View style={styles.backTitleRow}>
                  <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {title}
                  </Text>
                  {subtitle && (
                    <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ) : leftContent ? (
            leftContent
          ) : (
            <View>
              {title && (
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
        {rightContent && <View style={styles.rightContainer}>{rightContent}</View>}
      </View>
    );
  };

  if (usePrimaryGradient) {
    return (
      <LinearGradient
        colors={colors.primary.gradient as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            height: containerHeight,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.content}>{renderContent()}</View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight,
          paddingTop: insets.top,
          backgroundColor: themeColors.background,
        },
      ]}
    >
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  defaultLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '100%',
  },
  childLayout: {
    flex: 1,
    justifyContent: 'center',
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginLeft: -4,
  },
  backButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: -4,
  },
  backText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    marginLeft: spacing.xs,
  },
  backTextInline: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    marginLeft: spacing.xs,
  },
  backTitleRow: {
    marginTop: spacing.xs,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'],
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    marginTop: spacing.xs - 2,
  },
});
