import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { normalize } from '../../utils/responsive';

interface HeaderProps {
  height?: number;
  title?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backLabel?: string;
}

export default function Header({
  height = 65,
  title,
  leftContent,
  rightContent,
  children,
  showBackButton = false,
  onBackPress,
  backLabel,
}: HeaderProps) {
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
    const textColor = themeColors.text;

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
        {/* Centered Title Layer */}
        {title && (
          <View style={styles.titleContainer} pointerEvents="none">
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Left Container */}
        <View style={styles.leftContainer}>
          {showBackButton ? (
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
          ) : (
            leftContent
          )}
        </View>

        {/* Right Container */}
        <View style={styles.rightContainer}>
          {rightContent}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight,
          paddingTop: insets.top,
          backgroundColor: themeColors.card,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
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
    marginBottom: spacing.sm,
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
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
    minWidth: 40,
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
    minWidth: 40,
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
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
  },
});
