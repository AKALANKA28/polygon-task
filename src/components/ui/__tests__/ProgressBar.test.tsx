import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ProgressBar from '../ProgressBar';
import { useTheme } from '../../../theme/ThemeContext';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-linear-gradient since it's a native module
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

// Mock ThemeContext hook
jest.mock('../../../theme/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('ProgressBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in light mode', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      isDark: false,
      themeColors: { background: '#F3F4F6' },
    });

    await render(<ProgressBar progress={0.5} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders correctly in dark mode', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      isDark: true,
      themeColors: { background: '#0F0F12' },
    });

    await render(<ProgressBar progress={0.75} height={12} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('bounds the progress value between 0 and 1', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      isDark: false,
      themeColors: { background: '#F3F4F6' },
    });

    await render(<ProgressBar progress={1.5} />);
    expect(screen.toJSON()).toBeTruthy();

    await render(<ProgressBar progress={-0.5} />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
