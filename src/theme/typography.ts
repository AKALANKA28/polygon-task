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

export const typography = {
  fonts: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
  },
  sizes: {
    xs: normalize(10),
    sm: normalize(12),
    base: normalize(14),
    md: normalize(16),
    lg: normalize(18),
    xl: normalize(20),
    '2xl': normalize(24),
    '3xl': normalize(30),
    '4xl': normalize(36),
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
