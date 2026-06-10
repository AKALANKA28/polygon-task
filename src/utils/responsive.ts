import { Dimensions, PixelRatio, Platform, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

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

/**
 * Dynamic responsive hook — uses live window dimensions so values
 * update on rotation, split-screen, and foldable devices.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const dynamicNormalize = (size: number, factor = 0.5) => {
      const scale = width / BASE_WIDTH;
      const newSize = size * (1 + (scale - 1) * factor);
      if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
      }
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
    };

    return {
      width,
      height,
      normalize: dynamicNormalize,
      scaleWidth: (size: number) => (width / BASE_WIDTH) * size,
      scaleHeight: (size: number) => (height / BASE_HEIGHT) * size,
      isSmallDevice: width < 375,
      isTablet: width >= 768,
    };
  }, [width, height]);
}

