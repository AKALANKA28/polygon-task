import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface GradientHeaderProps {
  height?: number;
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

export default function GradientHeader({
  height = 160,
  title,
  subtitle,
  leftContent,
  rightContent,
  children,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors.primary.gradient as unknown as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { height: height + insets.top, paddingTop: insets.top }]}
    >
      {/* Decorative vector overlays */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

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
                  {title && <Text style={styles.title}>{title}</Text>}
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
              )}
            </View>
            {rightContent && <View style={styles.rightContainer}>{rightContent}</View>}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -80,
    left: -40,
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
    color: colors.white,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm + 1,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});
