import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { Avatar as DiceBearAvatar } from '@dicebear/core';
// @ts-ignore
import lorelei from '@dicebear/styles/dist/lorelei.min.json';
import { normalize } from '../../utils/responsive';

interface AvatarProps {
  name: string;
  size?: number;
  fontSize?: number; // Kept for backwards compatibility
}

const AVATAR_GRADIENTS = [
  ['#FF1F8E', '#8B1FCC'], // Magenta to Purple
  ['#FF8F00', '#FF1F8E'], // Orange to Magenta
  ['#8B1FCC', '#00C4FF'], // Purple to Blue
  ['#00C4FF', '#00FF87'], // Blue to Green
  ['#FF3D00', '#FFB800'], // Red to Amber
];

export default function Avatar({ name, size = 40 }: AvatarProps) {
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

  const svgXml = useMemo(() => {
    // Generate deterministic avatar using the name/seed
    const avatar = new DiceBearAvatar(lorelei as any, {
      seed: name,
    });
    return avatar.toString();
  }, [name]);

  return (
    <View style={[styles.container, { width: normalizedSize, height: normalizedSize, borderRadius: normalizedSize / 2 }]}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SvgXml xml={svgXml} width={normalizedSize} height={normalizedSize} />
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
});
