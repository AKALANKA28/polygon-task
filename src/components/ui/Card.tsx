import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stripeColor?: string;
  onPress?: () => void;
}

export default function Card({ children, style, stripeColor }: CardProps) {
  return (
    <View style={[styles.card, shadows.sm, style]}>
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surface.border,
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
