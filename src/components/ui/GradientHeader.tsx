import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface GradientHeaderProps {
  height?: number;
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

export default function GradientHeader({
  height = 90,
  title,
  subtitle,
  leftContent,
  rightContent,
  children,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const { themeColors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          height: height + insets.top,
          paddingTop: insets.top,
          backgroundColor: themeColors.background,
        },
      ]}
    >
      <View style={styles.content}>
        {children ? (
          children
        ) : (
          <View style={styles.defaultLayout}>
            <View style={styles.leftContainer}>
              {leftContent ? (
                leftContent
              ) : (
                <View>
                  {title && <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>}
                  {subtitle && <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>}
                </View>
              )}
            </View>
            {rightContent && <View style={styles.rightContainer}>{rightContent}</View>}
          </View>
        )}
      </View>
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
    zIndex: 1,
  },
  defaultLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'],
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    marginTop: spacing.xs,
  },
});
