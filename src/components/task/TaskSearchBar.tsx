import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { normalize } from '../../utils/responsive';

interface TaskSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function TaskSearchBar({ value, onChangeText }: TaskSearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const { isDark, themeColors } = useTheme();

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderColor: isFocused ? colors.brand.purple : themeColors.border,
        }
      ]}
    >
      <View style={styles.searchIcon}>
        <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
          <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>

      <TextInput
        style={[styles.input, { color: themeColors.text }]}
        placeholder="Search tasks..."
        placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        clearButtonMode="never"
      />

      {value.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.6}>
          <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2}>
            <Path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(48),
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
