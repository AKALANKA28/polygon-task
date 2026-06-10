import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const BASE_WIDTH = 375;

const normalize = (size: number, factor = 0.5) => {
  const scale = screenWidth / BASE_WIDTH;
  const newSize = size * (1 + (scale - 1) * factor);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1);
};

export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  base: normalize(16),
  lg: normalize(20),
  xl: normalize(24),
  '2xl': normalize(32),
  '3xl': normalize(40),
  '4xl': normalize(48),
};

export const radius = {
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(20),
  '2xl': normalize(24),
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#8B1FCC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: normalize(8),
    elevation: 2,
  },
  md: {
    shadowColor: '#FF1F8E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: normalize(16),
    elevation: 6,
  },
  lg: {
    shadowColor: '#FF1F8E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: normalize(24),
    elevation: 12,
  },
};
