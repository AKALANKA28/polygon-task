import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  subtitle,
  actionTitle,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const displayActionTitle = actionTitle || actionLabel;
  const { isDark, themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || (
          <Svg 
            width={64} 
            height={64} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={isDark ? colors.neutral[600] : colors.neutral[300]} 
            strokeWidth={1.5}
          >
            <Path d="M9 13h6M9 17h3" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <Path d="M14 2v6h6" />
          </Svg>
        )}
      </View>
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>

      {displayActionTitle && onAction && (
        <View style={styles.actionContainer}>
          <Button title={displayActionTitle} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.base,
    opacity: 0.8,
  },
  title: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md + 1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  actionContainer: {
    marginTop: spacing.lg,
    width: '60%',
  },
});
