import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  leftIcon?: 'email' | 'lock' | 'user' | 'phone' | 'building';
  error?: string;
  showPasswordToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

// Inline SVGs mapping for Input
const InputIcon = ({ name, color }: { name: string; color: string }) => {
  switch (name) {
    case 'email':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Path d="M22 6l-10 7L2 6" />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <Path d="M4 11h16v10H4z" />
          <Path d="M7 11V7a5 5 0 0110 0v4" />
        </Svg>
      );
    case 'user':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </Svg>
      );
    case 'phone':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.06 3h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.09 9.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </Svg>
      );
    case 'building':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M3 21h18M9 21V9a3 3 0 00-3-3H4a3 3 0 00-3 3v12h8zm6 0V5a3 3 0 00-3-3h-2a3 3 0 00-3 3v16h8zm6 0V11a3 3 0 00-3-3h-2a3 3 0 00-3 3v10h8z" />
        </Svg>
      );
    default:
      return null;
  }
};

export default function Input({
  label,
  leftIcon,
  error,
  showPasswordToggle,
  secureTextEntry,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setIsSecure((prev) => !prev);
  };

  // Determine colors based on state
  const iconColor = error
    ? colors.semantic.error
    : isFocused
    ? colors.brand.purple
    : colors.neutral[400];

  const borderColor = error
    ? colors.semantic.error
    : isFocused
    ? colors.brand.purple
    : colors.surface.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      
      <View style={[styles.inputWrapper, { borderColor }]}>
        {leftIcon && (
          <View style={styles.leftIconWrapper}>
            <InputIcon name={leftIcon} color={iconColor} />
          </View>
        )}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithIcon : null]}
          placeholderTextColor={colors.neutral[400]}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIconWrapper}
            onPress={togglePasswordVisibility}
            activeOpacity={0.6}
          >
            {isSecure ? (
              // Eye-off
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[500]} strokeWidth={2}>
                <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <Path d="M1 1l22 22" />
              </Svg>
            ) : (
              // Eye
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[500]} strokeWidth={2}>
                <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <Circle cx={12} cy={12} r={3} />
              </Svg>
            )}
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
    width: '100%',
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm + 1,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  labelError: {
    color: colors.semantic.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  eyeIconWrapper: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
});
