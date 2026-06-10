import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stripeColor?: string;
  onPress?: () => void;
}

export default function Card({ children, style, stripeColor }: CardProps) {
  const { themeColors } = useTheme();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      },
      shadows.sm,
      style
    ]}>
      {stripeColor && (
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
  },
  stripe: {
    width: 5,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
});
