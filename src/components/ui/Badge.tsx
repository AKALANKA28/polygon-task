import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({
  label,
  backgroundColor = colors.neutral[100],
  textColor = colors.neutral[700],
  borderColor,
  size = 'sm',
}: BadgeProps) {
  const isOutline = !!borderColor;

  return (
    <View
      style={[
        styles.container,
        styles[size],
        {
          backgroundColor: isOutline ? 'transparent' : backgroundColor,
          borderColor: borderColor || 'transparent',
          borderWidth: isOutline ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.text, styles[`text_${size}`], { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  lg: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: typography.fonts.semiBold,
  },
  text_sm: {
    fontSize: typography.sizes.xs,
  },
  text_md: {
    fontSize: typography.sizes.sm,
  },
  text_lg: {
    fontSize: typography.sizes.base,
  },
});
