import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();

  // Animation shared values
  const translateY = useSharedValue(-100);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Listen to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Pulse animation for the offline dot
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [pulseOpacity]);

  useEffect(() => {
    // Slide in/out transition
    if (isOffline) {
      translateY.value = withSpring(insets.top + 12, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      translateY.value = withSpring(-100, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isOffline, translateY, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: width - 32,
          backgroundColor: isDark ? 'rgba(23, 23, 28, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderColor: isDark ? 'rgba(255, 107, 26, 0.3)' : 'rgba(255, 107, 26, 0.15)',
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.dot, pulseStyle]} />
        <Text style={[styles.text, { color: isDark ? colors.white : colors.neutral[900] }]}>
          Offline Mode. Changes will sync when online.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backdropFilter: 'blur(10px)', // For web support if needed
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B1A', // Orange theme accent color
    marginRight: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
});
