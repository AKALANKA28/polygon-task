import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (standard iPhone width 375px, height 812px)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const scaleWidth = (size: number) => {
  return (screenWidth / BASE_WIDTH) * size;
};

export const scaleHeight = (size: number) => {
  return (screenHeight / BASE_HEIGHT) * size;
};

export const normalize = (size: number, factor = 0.5) => {
  const scale = screenWidth / BASE_WIDTH;
  const newSize = size * (1 + (scale - 1) * factor);
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};

export const deviceDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice: screenWidth < 375,
  isTablet: screenWidth >= 768,
};
