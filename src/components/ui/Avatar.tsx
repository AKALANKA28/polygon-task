import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { normalize } from '../../utils/responsive';

interface AvatarProps {
  name: string;
  size?: number;
  fontSize?: number;
}

const AVATAR_GRADIENTS = [
  ['#FF1F8E', '#8B1FCC'], // Magenta to Purple
  ['#FF8F00', '#FF1F8E'], // Orange to Magenta
  ['#8B1FCC', '#00C4FF'], // Purple to Blue
  ['#00C4FF', '#00FF87'], // Blue to Green
  ['#FF3D00', '#FFB800'], // Red to Amber
];

export default function Avatar({ name, size = 40, fontSize }: AvatarProps) {
  const initials = useMemo(() => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }, [name]);

  const gradientColors = useMemo(() => {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  }, [name]);

  const normalizedSize = normalize(size);
  const calculatedFontSize = fontSize ? normalize(fontSize) : Math.max(8, Math.floor(normalizedSize * 0.4));

  return (
    <View style={[styles.container, { width: normalizedSize, height: normalizedSize, borderRadius: normalizedSize / 2 }]}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, { fontSize: calculatedFontSize }]}>
          {initials}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: typography.fonts.bold,
    color: colors.white,
    textTransform: 'uppercase',
  },
});
